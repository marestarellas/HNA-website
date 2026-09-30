"use client";

import { useEffect, useRef, useState } from "react";
import { SECTIONS } from "../_content";
import { PALETTE } from "../_palette";

/**
 * Four streams that gather into one channel.
 *
 * The navigation is the picture. Each entrance is a rivulet starting at the
 * top edge and finding its way down, thin at the source and heavier as it
 * goes, until all four converge and leave the page as a single channel. Four
 * ways in, one question they drain toward.
 *
 * The ribbons are polygons rather than strokes because a stroke cannot change
 * width along its length, and a stream of constant width is a pipe. Both edges
 * are generated from one centreline, so widening is a property of the water
 * rather than of the line drawn around it.
 */

const VB_W = 100;
const VB_H = 200;
const CONVERGE_X = 50;
const SAMPLES = 84;
const PARTICLES = 12;

type Stream = {
	x0: number;
	amp: number;
	freq: number;
	phase: number;
	drift: number;
	color: string;
	/** Where the section title sits along the stream, 0 at the source. */
	labelAt: number;
};

const STREAMS: Stream[] = [
	{ x0: 15, amp: 7.5, freq: 2.1, phase: 0.0, drift: 0.10, color: PALETTE.forest, labelAt: 0.13 },
	{ x0: 37, amp: 6.0, freq: 2.7, phase: 1.7, drift: 0.13, color: PALETTE.northSea, labelAt: 0.35 },
	{ x0: 64, amp: 6.8, freq: 2.3, phase: 3.1, drift: 0.11, color: PALETTE.atacama, labelAt: 0.57 },
	{ x0: 86, amp: 8.2, freq: 1.9, phase: 4.6, drift: 0.09, color: PALETTE.ochre, labelAt: 0.78 },
];

/** Where the centre of a stream is, at a fraction along its length. */
function centreX(s: Stream, t: number, time: number): number {
	const pull = Math.pow(t, 2.4); // convergence happens late, all at once
	const base = s.x0 + (CONVERGE_X - s.x0) * pull;
	const taper = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.9) * (1 - t * t * t);
	const meander =
		Math.sin(t * s.freq * Math.PI * 2 + s.phase + time * s.drift) * 0.62 +
		Math.sin(t * s.freq * 1.9 * Math.PI * 2 + s.phase * 1.4 - time * s.drift * 0.7) * 0.38;
	return base + meander * s.amp * taper;
}

/** How wide it is there: a trickle at the source, gathering volume downhill. */
function widthAt(s: Stream, t: number, time: number, boost: number): number {
	const body = 0.3 + 0.7 * Math.min(1, t * 3.2);
	const swell = 1 + 0.28 * Math.sin((t * 2.2 - time * 0.18) * Math.PI * 2 + s.phase);
	return (0.5 + 2.6 * body) * swell * (1 + boost * 0.95);
}

function ribbon(s: Stream, time: number, boost: number): string {
	const left: string[] = [];
	const right: string[] = [];
	for (let i = 0; i <= SAMPLES; i++) {
		const t = i / SAMPLES;
		const y = t * VB_H;
		const x = centreX(s, t, time);
		const w = widthAt(s, t, time, boost) / 2;
		left.push(`${(x - w).toFixed(2)} ${y.toFixed(2)}`);
		right.push(`${(x + w).toFixed(2)} ${y.toFixed(2)}`);
	}
	right.reverse();
	return `M ${left.join(" L ")} L ${right.join(" L ")} Z`;
}

export function Rivulets() {
	const pathRefs = useRef<Array<SVGPathElement | null>>([]);
	const dotRefs = useRef<Array<SVGCircleElement | null>>([]);
	const pulseRefs = useRef<Array<SVGCircleElement | null>>([]);
	const hoverRef = useRef<number | null>(null);
	const boostRef = useRef([0, 0, 0, 0]);
	const pulseRef = useRef<Array<number | null>>([null, null, null, null]);
	const [hover, setHover] = useState<number | null>(null);

	useEffect(() => {
		hoverRef.current = hover;
	}, [hover]);

	useEffect(() => {
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		const seeds = STREAMS.map((_, si) =>
			Array.from({ length: PARTICLES }, (_, i) => (i + si * 0.37) / PARTICLES)
		);

		const draw = (time: number, dt: number) => {
			for (let si = 0; si < STREAMS.length; si++) {
				const s = STREAMS[si];
				const target = hoverRef.current === si ? 1 : hoverRef.current === null ? 0 : -0.35;
				boostRef.current[si] += (target - boostRef.current[si]) * Math.min(1, dt * 6);
				const boost = boostRef.current[si];

				const node = pathRefs.current[si];
				if (node) node.setAttribute("d", ribbon(s, time, boost));

				// Flow, made countable. The dots are what tell you the ribbon is
				// moving rather than merely wobbling.
				for (let pi = 0; pi < PARTICLES; pi++) {
					const idx = si * PARTICLES + pi;
					const dot = dotRefs.current[idx];
					if (!dot) continue;
					seeds[si][pi] = (seeds[si][pi] + dt * (0.055 + boost * 0.07) + 1) % 1;
					const t = seeds[si][pi];
					dot.setAttribute("cx", centreX(s, t, time).toFixed(2));
					dot.setAttribute("cy", (t * VB_H).toFixed(2));
					dot.setAttribute("r", (0.28 + 0.5 * Math.min(1, t * 3)).toFixed(2));
					dot.setAttribute("opacity", (0.18 + boost * 0.5).toFixed(2));
				}

				// A click sends one bright thing down the channel, once.
				const pulse = pulseRef.current[si];
				const pnode = pulseRefs.current[si];
				if (pulse !== null && pnode) {
					const next = pulse + dt * 0.85;
					if (next >= 1) {
						pulseRef.current[si] = null;
						pnode.setAttribute("opacity", "0");
					} else {
						pulseRef.current[si] = next;
						pnode.setAttribute("cx", centreX(s, next, time).toFixed(2));
						pnode.setAttribute("cy", (next * VB_H).toFixed(2));
						pnode.setAttribute("opacity", (1 - next * 0.4).toFixed(2));
					}
				}
			}
		};

		// One frame before the loop, so the streams are drawn even where
		// requestAnimationFrame never runs.
		draw(0, 0);
		if (reduced) return;

		let raf = 0;
		let last = performance.now();
		const tick = (now: number) => {
			const dt = Math.min((now - last) / 1000, 0.08);
			last = now;
			draw(now / 1000, dt);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	return (
		<div className="relative w-full" style={{ height: "min(190vh, 1500px)" }}>
			<svg
				className="absolute inset-0 h-full w-full"
				viewBox={`0 0 ${VB_W} ${VB_H}`}
				preserveAspectRatio="none"
				aria-hidden
			>
				{/* The channel they all leave by. */}
				<path
					d={`M ${CONVERGE_X - 5} ${VB_H - 26} L ${CONVERGE_X - 7} ${VB_H} L ${CONVERGE_X + 7} ${VB_H} L ${CONVERGE_X + 5} ${VB_H - 26} Z`}
					fill={PALETTE.umberDeep}
					opacity={0.14}
				/>
				{STREAMS.map((s, i) => (
					<path
						key={`r${i}`}
						ref={(el) => {
							pathRefs.current[i] = el;
						}}
						d={ribbon(s, 0, 0)}
						fill={s.color}
						opacity={hover === null ? 0.62 : hover === i ? 0.85 : 0.28}
						style={{ transition: "opacity 0.35s ease" }}
					/>
				))}
				{STREAMS.map((_s, si) =>
					Array.from({ length: PARTICLES }, (_, pi) => (
						<circle
							key={`d${si}-${pi}`}
							ref={(el) => {
								dotRefs.current[si * PARTICLES + pi] = el;
							}}
							r={0.4}
							fill={PALETTE.cream}
							opacity={0.2}
						/>
					))
				)}
				{STREAMS.map((_s, i) => (
					<circle
						key={`p${i}`}
						ref={(el) => {
							pulseRefs.current[i] = el;
						}}
						r={1.3}
						fill={PALETTE.creamText}
						opacity={0}
					/>
				))}
			</svg>

			{/* Titles, each beside its own stream. */}
			{SECTIONS.map((sec, i) => {
				const s = STREAMS[i];
				const x = centreX(s, s.labelAt, 0);
				const rightSide = x < 50;
				return (
					<div
						key={sec.href}
						className="absolute w-[min(30rem,42vw)]"
						style={{
							top: `${s.labelAt * 100}%`,
							left: rightSide ? `calc(${x}% + 2.5rem)` : undefined,
							right: rightSide ? undefined : `calc(${100 - x}% + 2.5rem)`,
							textAlign: rightSide ? "left" : "right",
							transform: "translateY(-40%)",
						}}
					>
						<a
							href="/design/confluence"
							onMouseEnter={() => setHover(i)}
							onMouseLeave={() => setHover(null)}
							onFocus={() => setHover(i)}
							onBlur={() => setHover(null)}
							onClick={() => {
								pulseRef.current[i] = 0;
							}}
							className="group block"
						>
							<span
								className="font-mono text-[10px] uppercase tracking-[0.3em]"
								style={{ color: s.color, opacity: 0.75 }}
							>
								{sec.number}
							</span>
							<h2
								className="mt-2"
								style={{
									fontSize: "clamp(26px, 3.4vw, 50px)",
									fontWeight: 400,
									lineHeight: 1.05,
									letterSpacing: "-0.018em",
									color: hover === i ? s.color : PALETTE.inkText,
									transition: "color 0.35s ease",
								}}
							>
								{sec.title}
							</h2>
							<p className="mt-3 text-[15px] leading-relaxed" style={{ opacity: 0.7 }}>
								{sec.blurb}
							</p>
						</a>
					</div>
				);
			})}
		</div>
	);
}
