"use client";

import { useEffect, useRef } from "react";

// Underwater light. Many soft cyan radial spots drifting on slow
// sinusoidal orbits, additively blended into a deep-teal background. Cheap
// and convincing — looks like sunlight refracted through a moving water
// surface.

type Spot = {
	baseX: number;
	baseY: number;
	radius: number;
	brightness: number;
	rxAmp: number;
	ryAmp: number;
	speed: number;
	phase: number;
};

export function Caustics() {
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
			return { w: canvas.clientWidth, h: canvas.clientHeight };
		};

		let { w, h } = sizeCanvas();

		const SPOTS_N = 22;
		const seed = (): Spot[] => {
			const arr: Spot[] = [];
			for (let i = 0; i < SPOTS_N; i++) {
				arr.push({
					baseX: Math.random() * w,
					baseY: Math.random() * h,
					radius: 80 + Math.random() * 220,
					brightness: 0.10 + Math.random() * 0.18,
					rxAmp: 40 + Math.random() * 90,
					ryAmp: 30 + Math.random() * 70,
					speed: 0.08 + Math.random() * 0.18,
					phase: Math.random() * Math.PI * 2,
				});
			}
			return arr;
		};

		let spots = seed();

		const onResize = () => {
			({ w, h } = sizeCanvas());
			spots = seed();
		};
		window.addEventListener("resize", onResize);

		let raf = 0;
		const start = performance.now();

		const tick = () => {
			const t = (performance.now() - start) / 1000;

			// Deep teal base
			ctx.fillStyle = "#051820";
			ctx.fillRect(0, 0, w, h);

			// Vertical light shaft hint
			const shaftGrad = ctx.createLinearGradient(0, 0, 0, h);
			shaftGrad.addColorStop(0, "rgba(184, 232, 240, 0.08)");
			shaftGrad.addColorStop(0.4, "rgba(184, 232, 240, 0.03)");
			shaftGrad.addColorStop(1, "rgba(184, 232, 240, 0)");
			ctx.fillStyle = shaftGrad;
			ctx.fillRect(0, 0, w, h);

			// Caustic spots — additive blending
			ctx.globalCompositeOperation = "lighter";
			for (const s of spots) {
				const x = s.baseX + Math.sin(t * s.speed + s.phase) * s.rxAmp;
				const y = s.baseY + Math.cos(t * s.speed * 0.73 + s.phase) * s.ryAmp;
				const breath = 0.55 + 0.45 * Math.sin(t * 0.6 + s.phase * 1.3);
				const alpha = s.brightness * breath;

				const grad = ctx.createRadialGradient(x, y, 0, x, y, s.radius);
				grad.addColorStop(0, `rgba(200, 240, 248, ${alpha})`);
				grad.addColorStop(0.5, `rgba(140, 210, 220, ${alpha * 0.4})`);
				grad.addColorStop(1, "rgba(140, 210, 220, 0)");
				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.arc(x, y, s.radius, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.globalCompositeOperation = "source-over";

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", onResize);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 h-full w-full"
			aria-hidden
		/>
	);
}
