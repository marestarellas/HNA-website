"use client";

import { useEffect, useRef, useState } from "react";

// Two oscillators with slightly different natural frequencies. With coupling
// K = 0 they drift apart freely; as K rises they lock into phase. The textbook
// illustration of entrainment.
//
//   dθ₁/dt = ω₁ + K · sin(θ₂ − θ₁)
//   dθ₂/dt = ω₂ + K · sin(θ₁ − θ₂)
//
// This is a bootstrap-quality demo — the real one in Section 2 will be more
// considered visually and pedagogically.

const OMEGA_1 = 2 * Math.PI * 1.0;
const OMEGA_2 = 2 * Math.PI * 1.4;
const HISTORY_SECONDS = 5;
const TARGET_FPS = 60;

export function CoupledOscillators() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [coupling, setCoupling] = useState(0);
	const couplingRef = useRef(coupling);

	useEffect(() => {
		couplingRef.current = coupling;
	}, [coupling]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const sizeCanvas = () => {
			const dpr = window.devicePixelRatio || 1;
			const cssWidth = canvas.clientWidth;
			const cssHeight = canvas.clientHeight;
			canvas.width = cssWidth * dpr;
			canvas.height = cssHeight * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			return { cssWidth, cssHeight };
		};

		let { cssWidth, cssHeight } = sizeCanvas();
		const onResize = () => {
			({ cssWidth, cssHeight } = sizeCanvas());
		};
		window.addEventListener("resize", onResize);

		let theta1 = 0;
		let theta2 = Math.PI / 2;
		const maxSamples = HISTORY_SECONDS * TARGET_FPS;
		const history1: number[] = [];
		const history2: number[] = [];

		const fg = getComputedStyle(canvas).color || "#1a1a1a";

		let lastTime = performance.now();
		let raf = 0;

		const tick = (now: number) => {
			const dt = Math.min(0.05, (now - lastTime) / 1000);
			lastTime = now;
			const K = couplingRef.current;

			const dTheta1 = OMEGA_1 + K * Math.sin(theta2 - theta1);
			const dTheta2 = OMEGA_2 + K * Math.sin(theta1 - theta2);
			theta1 += dTheta1 * dt;
			theta2 += dTheta2 * dt;

			history1.push(Math.sin(theta1));
			history2.push(Math.sin(theta2));
			if (history1.length > maxSamples) history1.shift();
			if (history2.length > maxSamples) history2.shift();

			ctx.clearRect(0, 0, cssWidth, cssHeight);

			// Centerline
			ctx.strokeStyle = fg;
			ctx.globalAlpha = 0.12;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(0, cssHeight / 2);
			ctx.lineTo(cssWidth, cssHeight / 2);
			ctx.stroke();
			ctx.globalAlpha = 1;

			const drawTrace = (data: number[], alpha: number, lineWidth: number) => {
				ctx.strokeStyle = fg;
				ctx.globalAlpha = alpha;
				ctx.lineWidth = lineWidth;
				ctx.beginPath();
				const dx = cssWidth / maxSamples;
				for (let i = 0; i < data.length; i++) {
					const x = i * dx;
					const y = cssHeight / 2 - data[i] * (cssHeight * 0.4);
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.stroke();
				ctx.globalAlpha = 1;
			};

			drawTrace(history1, 0.95, 1.5);
			drawTrace(history2, 0.45, 1.5);

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", onResize);
		};
	}, []);

	return (
		<div>
			<canvas
				ref={canvasRef}
				className="w-full border border-rule text-foreground"
				style={{ height: 220 }}
				aria-label="Two sine waves drifting in and out of phase as the coupling slider changes."
			/>
			<div className="mt-4 flex items-center gap-4 font-sans text-xs uppercase tracking-[0.18em] text-muted">
				<label htmlFor="coupling" className="shrink-0">
					coupling K
				</label>
				<input
					id="coupling"
					type="range"
					min="0"
					max="5"
					step="0.05"
					value={coupling}
					onChange={(e) => setCoupling(parseFloat(e.target.value))}
					className="flex-1 accent-foreground"
				/>
				<span className="w-12 text-right tabular-nums text-foreground">
					{coupling.toFixed(2)}
				</span>
			</div>
		</div>
	);
}
