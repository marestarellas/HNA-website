"use client";

import { useEffect, useRef } from "react";

// Sediment bands stacked vertically. Each band's TOP edge is a wavy line
// whose phase drifts slowly, so the boundaries between bands subtly migrate
// the way real sediment lines look on a long erosion timescale.
//
// ViewBox uses 0–100 width and the page's actual height in CSS pixels for y,
// so band spacing scales with the viewport. We only update path `d`
// attributes per frame — colors and structure stay put.

type Band = {
	yTop: number;        // baseline y position (0–100, percent of viewBox height)
	amp: number;         // wave amplitude
	freq: number;        // cycles across width
	speed: number;       // phase drift rate
	color: string;
};

// Top → bottom, light → deep. Chromatic palette inherited from the Editorial
// covers: cream wash → soft ochre → terracotta → forest green → north-sea
// blue → near-black. Reads as a sunset cross-section through different
// mineral layers rather than a single brown bluff.
const BANDS: Band[] = [
	{ yTop: 0,    amp: 0,  freq: 0,    speed: 0,    color: "#e9dfca" }, // cream wash (salt flat)
	{ yTop: 16,   amp: 4,  freq: 1.1,  speed: 0.10, color: "#c69958" }, // soft ochre
	{ yTop: 30,   amp: 6,  freq: 0.9,  speed: 0.08, color: "#a8523a" }, // atacama
	{ yTop: 46,   amp: 5,  freq: 1.4,  speed: 0.13, color: "#7a3a26" }, // atacama deep
	{ yTop: 60,   amp: 7,  freq: 0.7,  speed: 0.06, color: "#1f3a2e" }, // forest
	{ yTop: 74,   amp: 5,  freq: 1.2,  speed: 0.10, color: "#2a3949" }, // north sea
	{ yTop: 88,   amp: 3,  freq: 1.6,  speed: 0.14, color: "#101820" }, // deep
];

const SAMPLES = 110;

function bandPath(b: Band, t: number): string {
	let d = `M 0 100`;
	d += ` L 0 ${b.yTop.toFixed(2)}`;
	for (let i = 1; i <= SAMPLES; i++) {
		const x = (i / SAMPLES) * 100;
		const phase = (x / 100) * b.freq * Math.PI * 2 + t * b.speed;
		const y =
			b.yTop +
			Math.sin(phase) * b.amp * 0.7 +
			Math.sin(phase * 2.7 + 0.6) * b.amp * 0.3;
		d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
	}
	d += " L 100 100 Z";
	return d;
}

export function StrataBands() {
	const refs = useRef<Array<SVGPathElement | null>>([]);

	useEffect(() => {
		let raf = 0;
		const start = performance.now();
		const tick = () => {
			const t = (performance.now() - start) / 1000;
			for (let i = 0; i < BANDS.length; i++) {
				const node = refs.current[i];
				if (node) node.setAttribute("d", bandPath(BANDS[i], t));
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
			{BANDS.map((b, i) => (
				<path
					key={i}
					ref={(el) => {
						refs.current[i] = el;
					}}
					fill={b.color}
					d={bandPath(b, 0)}
				/>
			))}
		</svg>
	);
}
