"use client";

import { motion } from "motion/react";

// Three large organic blob shapes in warm earth tones, slowly morphing
// between preset paths. An SVG turbulence filter displaces the edges so the
// boundaries read as wet ink dispersing rather than as crisp vector shapes.

type BlobConfig = {
	cx: string;
	cy: string;
	size: string;
	color: string;
	opacity: number;
	duration: number;
	paths: [string, string, string];
};

// Three blobs in the Editorial palette — terracotta, forest green, north
// sea — dispersed into a warm cream field. Each leans on the same shared
// chromatic vocabulary as the rest of the family.
const BLOBS: BlobConfig[] = [
	{
		cx: "20%",
		cy: "30%",
		size: "85vw",
		color: "#a8523a", // atacama
		opacity: 0.55,
		duration: 28,
		paths: [
			"M44,-49 C58,-39 70,-22 73,-3 C76,16 71,37 58,52 C45,67 24,76 4,75 C-15,73 -34,61 -47,46 C-60,30 -68,11 -67,-9 C-67,-29 -58,-49 -42,-58 C-26,-67 -3,-65 16,-62 C35,-58 30,-59 44,-49Z",
			"M50,-44 C62,-31 67,-10 64,9 C61,28 49,46 32,57 C15,68 -7,72 -27,67 C-46,62 -64,46 -71,27 C-79,8 -75,-15 -64,-32 C-53,-49 -34,-60 -14,-64 C5,-67 24,-63 50,-44Z",
			"M40,-52 C53,-44 63,-30 67,-13 C71,4 70,24 60,38 C49,53 30,63 11,67 C-9,71 -29,68 -45,58 C-61,48 -73,30 -75,11 C-77,-9 -69,-30 -56,-43 C-43,-56 -25,-62 -6,-64 C13,-66 26,-60 40,-52Z",
		],
	},
	{
		cx: "75%",
		cy: "55%",
		size: "100vw",
		color: "#1f3a2e", // forest
		opacity: 0.50,
		duration: 34,
		paths: [
			"M55,-50 C68,-36 73,-15 70,5 C67,25 56,45 39,58 C22,71 -1,77 -22,71 C-43,65 -62,47 -68,26 C-74,5 -67,-19 -53,-37 C-39,-55 -19,-66 1,-67 C20,-67 41,-64 55,-50Z",
			"M48,-60 C62,-49 71,-30 73,-11 C75,8 70,28 58,42 C46,56 28,64 9,67 C-10,70 -29,68 -45,58 C-61,48 -73,30 -75,11 C-77,-9 -68,-30 -54,-44 C-39,-58 -19,-65 1,-66 C20,-67 34,-71 48,-60Z",
			"M44,-55 C58,-44 70,-27 72,-9 C75,9 67,29 54,44 C41,59 22,69 2,71 C-19,73 -39,67 -53,55 C-67,42 -75,23 -75,4 C-75,-15 -67,-34 -54,-46 C-41,-58 -22,-65 -3,-65 C16,-66 30,-66 44,-55Z",
		],
	},
	{
		cx: "55%",
		cy: "85%",
		size: "70vw",
		color: "#2a3949", // north sea
		opacity: 0.45,
		duration: 40,
		paths: [
			"M52,-58 C66,-46 76,-29 78,-11 C80,7 73,25 60,38 C47,51 28,59 9,63 C-10,67 -29,67 -45,58 C-61,49 -73,32 -76,13 C-80,-7 -75,-29 -62,-43 C-49,-57 -29,-64 -10,-67 C9,-69 26,-69 52,-58Z",
			"M48,-55 C60,-44 65,-25 68,-6 C71,13 71,33 60,47 C49,61 27,69 7,69 C-13,69 -32,62 -45,49 C-58,36 -64,17 -65,-2 C-66,-22 -61,-43 -49,-55 C-37,-67 -18,-71 1,-72 C20,-72 36,-66 48,-55Z",
			"M44,-49 C58,-39 70,-22 73,-3 C76,16 71,37 58,52 C45,67 24,76 4,75 C-15,73 -34,61 -47,46 C-60,30 -68,11 -67,-9 C-67,-29 -58,-49 -42,-58 C-26,-67 -3,-65 16,-62 C35,-58 30,-59 44,-49Z",
		],
	},
];

export function InkBlobs() {
	return (
		<>
			{/* SVG turbulence filter — applied below to each blob's group */}
			<svg className="pointer-events-none fixed inset-0 h-0 w-0" aria-hidden>
				<filter id="ink-bleed">
					<feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3" />
					<feDisplacementMap in="SourceGraphic" scale="50" />
				</filter>
			</svg>

			{BLOBS.map((b, i) => (
				<svg
					key={i}
					className="pointer-events-none absolute"
					viewBox="-100 -100 200 200"
					style={{
						left: b.cx,
						top: b.cy,
						width: b.size,
						height: b.size,
						transform: "translate(-50%, -50%)",
						filter: "url(#ink-bleed)",
					}}
					aria-hidden
				>
					<motion.path
						animate={{ d: b.paths }}
						transition={{ duration: b.duration, repeat: Infinity, ease: "easeInOut" }}
						fill={b.color}
						opacity={b.opacity}
					/>
				</svg>
			))}
		</>
	);
}
