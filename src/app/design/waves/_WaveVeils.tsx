"use client";

import { useEffect, useRef } from "react";

// Stack of translucent SVG wave layers, each at its own y-center, amplitude,
// frequency, phase speed and color. Phases advance every frame; the path
// string is mutated directly on the DOM node (no React per-frame state) so
// the whole stack stays cheap. ViewBox is 0–100 in both dimensions and
// preserveAspectRatio="none" lets the waves stretch to fill any container.

type Wave = {
	y: number;
	amp: number;
	freq: number;
	speed: number;
	color: string;
	opacity: number;
};

// Bottom → top, dark → light. Chromatic, not monochrome: deep forest,
// north-sea blue, terracotta, warm ochre, cream. They overlap and the eye
// reads them as a single continuous gradient of color drifting in current.
const WAVES: Wave[] = [
	{ y: 78, amp: 10, freq: 1.6, speed: 0.30, color: "#0f2218", opacity: 0.95 }, // forest deep
	{ y: 70, amp: 14, freq: 1.2, speed: 0.45, color: "#1f3a2e", opacity: 0.82 }, // forest
	{ y: 62, amp: 18, freq: 0.9, speed: 0.28, color: "#2a3949", opacity: 0.70 }, // north sea
	{ y: 54, amp: 22, freq: 0.7, speed: 0.55, color: "#7a3a26", opacity: 0.55 }, // atacama deep
	{ y: 46, amp: 25, freq: 0.55, speed: 0.36, color: "#a8523a", opacity: 0.42 }, // atacama
	{ y: 38, amp: 28, freq: 0.45, speed: 0.62, color: "#c69958", opacity: 0.30 }, // ochre
	{ y: 30, amp: 32, freq: 0.38, speed: 0.42, color: "#e9dfca", opacity: 0.22 }, // cream
];

const SAMPLES = 96;

function pathFor(w: Wave, t: number): string {
	let d = `M 0 100 L 0 ${w.y.toFixed(2)}`;
	for (let i = 1; i <= SAMPLES; i++) {
		const x = (i / SAMPLES) * 100;
		const phase = (x / 100) * w.freq * Math.PI * 2 + t * w.speed;
		// Two summed harmonics so it never reads as a pure sine
		const y =
			w.y +
			Math.sin(phase) * w.amp * 0.55 +
			Math.sin(phase * 2.13 + 1.7) * w.amp * 0.30 +
			Math.sin(phase * 0.47 + 0.4) * w.amp * 0.15;
		d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
	}
	d += " L 100 100 Z";
	return d;
}

export function WaveVeils() {
	const pathRefs = useRef<Array<SVGPathElement | null>>([]);

	useEffect(() => {
		let raf = 0;
		const start = performance.now();
		const tick = () => {
			const t = (performance.now() - start) / 1000;
			for (let i = 0; i < WAVES.length; i++) {
				const node = pathRefs.current[i];
				if (node) node.setAttribute("d", pathFor(WAVES[i], t));
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	return (
		<svg
			className="absolute inset-0 h-full w-full"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			aria-hidden
		>
			{WAVES.map((w, i) => (
				<path
					key={i}
					ref={(el) => {
						pathRefs.current[i] = el;
					}}
					fill={w.color}
					opacity={w.opacity}
					d={pathFor(w, 0)}
				/>
			))}
		</svg>
	);
}
