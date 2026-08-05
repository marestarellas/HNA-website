"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useMotionValue, useMotionTemplate, useSpring } from "motion/react";

// Image card with a cursor-following lens. Two image layers are stacked:
//   bottom — the same photo with a "hidden" treatment (color-shifted, more
//            contrast, plus a faint EEG-like signal trace overlay)
//   top    — the normal photo, with a circular hole punched out by a
//            CSS mask centered on the cursor
//
// Outside the lens, the top photo covers everything. Inside the lens hole,
// the bottom is revealed — as if the surface had been cut away to expose the
// signal underneath. A thin chromatic-aberration ring marks the lens edge.

type LensImageProps = {
	src: string;
	alt: string;
	caption?: string;
};

const LENS_RADIUS = 120;

export function LensImage({ src, alt, caption }: LensImageProps) {
	const [active, setActive] = useState(false);
	const x = useMotionValue(-200);
	const y = useMotionValue(-200);
	const sx = useSpring(x, { stiffness: 700, damping: 40, mass: 0.5 });
	const sy = useSpring(y, { stiffness: 700, damping: 40, mass: 0.5 });

	// Hole in the top image: transparent inside the lens circle, opaque elsewhere.
	const mask = useMotionTemplate`radial-gradient(circle ${LENS_RADIUS}px at ${sx}px ${sy}px, transparent ${LENS_RADIUS - 4}px, black ${LENS_RADIUS}px)`;

	const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		x.set(e.clientX - rect.left);
		y.set(e.clientY - rect.top);
	};

	return (
		<figure
			className="relative w-full select-none"
			style={{ aspectRatio: "4/5" }}
		>
			<div
				className="relative h-full w-full overflow-hidden rounded-md"
				onPointerEnter={() => setActive(true)}
				onPointerLeave={() => setActive(false)}
				onPointerMove={onMove}
				style={{ cursor: "none" }}
			>
				{/* Hidden / scientific layer (always rendered behind) */}
				<div className="absolute inset-0">
					<Image
						src={src}
						alt=""
						fill
						sizes="(max-width: 768px) 100vw, 50vw"
						style={{
							objectFit: "cover",
							filter:
								"hue-rotate(165deg) saturate(1.4) contrast(1.35) brightness(0.9)",
						}}
					/>
					{/* Faint EEG-like signal trace overlay, rendered as inline SVG */}
					<svg
						aria-hidden
						className="absolute inset-x-0 bottom-0 h-1/3 w-full"
						viewBox="0 0 400 100"
						preserveAspectRatio="none"
					>
						<path
							d="M0,50 Q20,20 40,50 T80,50 T120,50 T160,50 T200,50 T240,50 T280,50 T320,50 T360,50 T400,50"
							fill="none"
							stroke="#cdf5ff"
							strokeOpacity="0.55"
							strokeWidth="0.7"
						/>
						<path
							d="M0,50 Q15,70 30,50 Q45,30 60,50 Q75,80 90,50 Q105,15 120,50 Q135,75 150,50 Q165,25 180,50 Q195,65 210,50 Q225,30 240,50 Q255,72 270,50 Q285,28 300,50 Q315,68 330,50 Q345,32 360,50 Q375,70 390,50 L400,50"
							fill="none"
							stroke="#b8e8f0"
							strokeOpacity="0.4"
							strokeWidth="0.5"
						/>
						{/* Frequency tick marks */}
						{Array.from({ length: 11 }, (_, i) => (
							<line
								key={i}
								x1={i * 40}
								y1="48"
								x2={i * 40}
								y2="52"
								stroke="#cdf5ff"
								strokeOpacity="0.3"
								strokeWidth="0.4"
							/>
						))}
					</svg>
					{/* Scientific text labels visible only through the lens */}
					<div className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[#cdf5ff]/70">
						eeg · α 8–12 Hz · fd 1.42
					</div>
				</div>

				{/* Top photographic layer — masked away inside the lens circle */}
				<motion.div
					className="absolute inset-0"
					style={{
						maskImage: mask,
						WebkitMaskImage: mask,
					}}
				>
					<Image
						src={src}
						alt={alt}
						fill
						sizes="(max-width: 768px) 100vw, 50vw"
						style={{ objectFit: "cover" }}
					/>
				</motion.div>

				{/* Lens ring + chromatic aberration hint */}
				<motion.div
					aria-hidden
					className="pointer-events-none absolute"
					style={{
						x: sx,
						y: sy,
						width: LENS_RADIUS * 2,
						height: LENS_RADIUS * 2,
						translateX: "-50%",
						translateY: "-50%",
						borderRadius: "50%",
						border: "1px solid rgba(205, 245, 255, 0.55)",
						boxShadow:
							"inset 0 0 0 1px rgba(255, 80, 80, 0.18), inset 0 0 0 -2px rgba(80, 200, 255, 0.18), 0 0 30px rgba(205, 245, 255, 0.18)",
						opacity: active ? 1 : 0,
						transition: "opacity 220ms ease-out",
					}}
				/>
			</div>

			{caption && (
				<figcaption className="mt-3 text-[10px] uppercase tracking-[0.32em] opacity-65">
					{caption}
				</figcaption>
			)}
		</figure>
	);
}
