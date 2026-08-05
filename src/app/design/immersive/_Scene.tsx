"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

// Full-viewport scene with a single hero image, slow Ken Burns zoom, and
// scroll-linked opacity / scale on the type so each scene "arrives" as you
// reach it.

type SceneProps = {
	image: string;
	imageAlt: string;
	eyebrow?: string;
	title: ReactNode;
	body?: ReactNode;
	align?: "center" | "left";
};

export function Scene({ image, imageAlt, eyebrow, title, body, align = "center" }: SceneProps) {
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
	const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.04, 1, 0.96]);
	const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

	return (
		<section
			ref={ref}
			className="relative flex h-[100vh] w-full items-center overflow-hidden text-white"
		>
			<div className="absolute inset-0 will-change-transform" style={{ animation: "ken-burns 32s ease-in-out infinite alternate" }}>
				<Image
					src={image}
					alt={imageAlt}
					fill
					priority
					sizes="100vw"
					style={{ objectFit: "cover" }}
				/>
				<div
					className="absolute inset-0"
					style={{
						background:
							"linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.55) 100%)",
					}}
				/>
			</div>

			<motion.div
				style={{ opacity, scale, y }}
				className={`relative z-10 mx-auto w-full max-w-[1500px] px-8 md:px-16 ${
					align === "center" ? "text-center" : "text-left"
				}`}
			>
				{eyebrow && (
					<p className="mb-6 text-[10px] uppercase tracking-[0.4em] opacity-80">{eyebrow}</p>
				)}
				<div
					style={{
						fontSize: "clamp(48px, 7.5vw, 120px)",
						lineHeight: 0.95,
						letterSpacing: "-0.02em",
						fontWeight: 300,
					}}
					className="font-serif"
				>
					{title}
				</div>
				{body && <div className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed opacity-85">{body}</div>}
			</motion.div>

			<style>{`@keyframes ken-burns { from { transform: scale(1) translate(0,0); } to { transform: scale(1.18) translate(-2%, -3%); } }`}</style>
		</section>
	);
}
