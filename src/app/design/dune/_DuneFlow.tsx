"use client";

import { useEffect, useRef } from "react";

// Long undulating "dune" curves stacked from horizon to foreground. Each
// dune is a filled SVG path with a vertical gradient (light at the crest,
// shadow underneath, going to deep umber at the base) so they read with
// raking-light depth. Crests phase-drift slowly, giving wind motion.

type Dune = {
	yBase: number;          // baseline y (0–100, percent of viewBox)
	amp: number;
	freq: number;
	speed: number;
	phaseOffset: number;
	gradId: string;
};

const DUNES: Dune[] = [
	{ yBase: 50, amp: 5,  freq: 0.55, speed: 0.10, phaseOffset: 0.0, gradId: "dune-g1" },
	{ yBase: 60, amp: 7,  freq: 0.7,  speed: 0.13, phaseOffset: 1.2, gradId: "dune-g2" },
	{ yBase: 70, amp: 9,  freq: 0.6,  speed: 0.08, phaseOffset: 2.5, gradId: "dune-g3" },
	{ yBase: 82, amp: 11, freq: 0.5,  speed: 0.16, phaseOffset: 0.6, gradId: "dune-g4" },
	{ yBase: 94, amp: 7,  freq: 0.85, speed: 0.20, phaseOffset: 3.1, gradId: "dune-g5" },
];

const SAMPLES = 110;

function dunePath(d: Dune, t: number): string {
	let path = `M 0 100 L 0 ${d.yBase.toFixed(2)}`;
	for (let i = 1; i <= SAMPLES; i++) {
		const x = (i / SAMPLES) * 100;
		const phase = (x / 100) * d.freq * Math.PI * 2 + t * d.speed + d.phaseOffset;
		const y =
			d.yBase -
			(Math.sin(phase) * d.amp * 0.7 + Math.sin(phase * 2.3 + 0.4) * d.amp * 0.3);
		path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
	}
	path += " L 100 100 Z";
	return path;
}

export function DuneFlow() {
	const refs = useRef<Array<SVGPathElement | null>>([]);

	useEffect(() => {
		let raf = 0;
		const start = performance.now();
		const tick = () => {
			const t = (performance.now() - start) / 1000;
			for (let i = 0; i < DUNES.length; i++) {
				const node = refs.current[i];
				if (node) node.setAttribute("d", dunePath(DUNES[i], t));
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	// Dune at golden hour — the chromatic palette interpreted as receding
	// land planes. Far ridges stay warm-blue (atmospheric perspective);
	// closer dunes turn earthy ochre and terracotta; the foreground is
	// almost-black forest. Each plane has a vertical gradient (crest
	// catches light, base falls into shadow).
	const palettes: Array<[string, string]> = [
		["#7d8ea0", "#4d5d6e"],   // far ridge — atmospheric blue
		["#c69958", "#7a4f2c"],   // mid ochre
		["#a8523a", "#7a3a26"],   // atacama
		["#3e5a4a", "#1f3a2e"],   // forest band
		["#0f2218", "#050a07"],   // foreground — near-black forest
	];

	return (
		<svg
			className="absolute inset-0 h-full w-full"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			aria-hidden
		>
			<defs>
				{DUNES.map((d, i) => (
					<linearGradient key={d.gradId} id={d.gradId} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={palettes[i][0]} />
						<stop offset="100%" stopColor={palettes[i][1]} />
					</linearGradient>
				))}
			</defs>
			{DUNES.map((d, i) => (
				<path
					key={i}
					ref={(el) => {
						refs.current[i] = el;
					}}
					fill={`url(#${d.gradId})`}
					d={dunePath(d, 0)}
				/>
			))}
		</svg>
	);
}
