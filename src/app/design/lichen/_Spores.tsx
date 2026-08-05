"use client";

import { useEffect, useRef } from "react";

// Tiny radial pulses bloom at random positions, each expands and fades
// over ~3s like a microscopic spore opening. Drawn additively into a
// canvas with a slow background fade so older pulses linger as ghosts.

type Spore = {
	x: number;
	y: number;
	birth: number;
	life: number;
	colorIdx: number; // index into PALETTE
	max: number;
};

// Three chromatic poles each spore can pick from — terracotta, forest, and
// north-sea blue. Plus a small chance of cream for highlight punctuation.
const PALETTE: Array<[number, number, number]> = [
	[168, 82, 58],   // atacama terracotta
	[31, 58, 46],    // forest green
	[42, 57, 73],    // north sea
	[233, 223, 202], // cream highlight (rare)
];
const WEIGHTS = [0.36, 0.34, 0.22, 0.08];

function pickColor(): number {
	const r = Math.random();
	let c = 0;
	for (let i = 0; i < WEIGHTS.length; i++) {
		c += WEIGHTS[i];
		if (r < c) return i;
	}
	return 0;
}

export function Spores({ rate = 1.2 }: { rate?: number }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const sizeCanvas = () => {
			const dpr = window.devicePixelRatio || 1;
			canvas.width = canvas.clientWidth * dpr;
			canvas.height = canvas.clientHeight * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		sizeCanvas();
		window.addEventListener("resize", sizeCanvas);

		const spores: Spore[] = [];
		let lastSpawn = performance.now();
		let raf = 0;

		const tick = () => {
			const now = performance.now();
			const w = canvas.clientWidth;
			const h = canvas.clientHeight;

			// Spawn
			if ((now - lastSpawn) / 1000 > 1 / rate) {
				lastSpawn = now;
				spores.push({
					x: Math.random() * w,
					y: Math.random() * h,
					birth: now,
					life: 2500 + Math.random() * 2500,
					colorIdx: pickColor(),
					max: 40 + Math.random() * 80,
				});
				if (spores.length > 80) spores.shift();
			}

			// Slow background fade (multiply-style by drawing semi-transparent bg)
			ctx.fillStyle = "rgba(244, 234, 211, 0.06)";
			ctx.fillRect(0, 0, w, h);

			for (let i = spores.length - 1; i >= 0; i--) {
				const s = spores[i];
				const age = (now - s.birth) / s.life;
				if (age >= 1) {
					spores.splice(i, 1);
					continue;
				}
				const radius = s.max * age;
				const alpha = (1 - age) * 0.30;
				const [r, g, b] = PALETTE[s.colorIdx];

				const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, radius);
				grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
				grad.addColorStop(0.7, `rgba(${r},${g},${b},${alpha * 0.3})`);
				grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
				ctx.fill();

				// Crisp rim
				ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.6})`;
				ctx.lineWidth = 0.6;
				ctx.beginPath();
				ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
				ctx.stroke();
			}

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", sizeCanvas);
		};
	}, [rate]);

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 h-full w-full"
			aria-hidden
		/>
	);
}
