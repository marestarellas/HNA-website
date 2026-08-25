"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Figure, Legend, Slider, Readout, SERIES_COLOR } from "./_ui";
import { pearson, plv, px } from "./_signals";

/**
 * Two Kuramoto oscillators with slightly different natural frequencies:
 *
 *   dθ₁/dt = ω₁ + K·sin(θ₂ − θ₁)
 *   dθ₂/dt = ω₂ + K·sin(θ₁ − θ₂)
 *
 * Below a threshold coupling they drift; above it they lock. The instructive
 * part is *how* they lock: the settled phase difference is arcsin(Δω / 2K), so
 * just above threshold they lock a quarter cycle apart. There, phase locking is
 * essentially perfect while the correlation between them sits near zero — which
 * is the entire reason the oscillatory family exists separately from the linear
 * one. Push K higher and the two measures finally agree.
 */

const F1 = 1.0;
const F2 = 1.35;
const HISTORY = 420;
const DT_CAP = 0.05;

function cssVar(el: HTMLElement, name: string, fallback: string): string {
	const v = getComputedStyle(el).getPropertyValue(name).trim();
	return v || fallback;
}

/**
 * Integrate the pair at fixed dt and return a settled window.
 *
 * The reported numbers come from here rather than from the animation loop.
 * Deriving them from `requestAnimationFrame` meant they only updated while
 * frames were being painted — so with `prefers-reduced-motion` the slider moved
 * and nothing changed, and the figure opened on a row of zeros. A fixed-step
 * simulation is also deterministic, so the server and client agree and the
 * readouts hold still instead of jittering at 10 Hz.
 */
function simulate(K: number, warmup = HISTORY * 3, keep = HISTORY) {
	const dt = 1 / 60;
	const w1 = 2 * Math.PI * F1;
	const w2 = 2 * Math.PI * F2;
	let th1 = 0;
	let th2 = Math.PI / 2;
	const s1: number[] = [];
	const s2: number[] = [];
	const p1: number[] = [];
	const p2: number[] = [];
	for (let i = 0; i < warmup + keep; i++) {
		th1 += (w1 + K * Math.sin(th2 - th1)) * dt;
		th2 += (w2 + K * Math.sin(th1 - th2)) * dt;
		if (i >= warmup) {
			s1.push(Math.sin(th1));
			s2.push(Math.sin(th2));
			p1.push(th1);
			p2.push(th2);
		}
	}
	const last = p1.length - 1;
	const d = p1[last] - p2[last];
	return {
		plv: plv(p1, p2),
		r: pearson(s1, s2),
		dphi: (Math.atan2(Math.sin(d), Math.cos(d)) * 180) / Math.PI,
	};
}

export function PhaseLocking() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [K, setK] = useState(0.6);
	const kRef = useRef(K);

	// Numbers come from the deterministic simulation, not the animation loop.
	const metrics = useMemo(() => simulate(K), [K]);

	useEffect(() => {
		kRef.current = K;
	}, [K]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const reduced =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		let colors = {
			world: cssVar(canvas, "--viz-world", "#BE6410"),
			body: cssVar(canvas, "--viz-body", "#1E6FA8"),
			rule: cssVar(canvas, "--rule", "#d8d4cc"),
		};
		const scheme = window.matchMedia("(prefers-color-scheme: dark)");
		const reread = () => {
			colors = {
				world: cssVar(canvas, "--viz-world", "#BE6410"),
				body: cssVar(canvas, "--viz-body", "#1E6FA8"),
				rule: cssVar(canvas, "--rule", "#d8d4cc"),
			};
		};
		scheme.addEventListener("change", reread);

		let w = 0;
		let h = 0;
		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		window.addEventListener("resize", resize);

		let th1 = 0;
		let th2 = Math.PI / 2;
		const s1: number[] = [];
		const s2: number[] = [];
		const p1: number[] = [];
		const p2: number[] = [];

		let last = performance.now();
		let raf = 0;

		const step = (dt: number) => {
			const k = kRef.current;
			const w1 = 2 * Math.PI * F1;
			const w2 = 2 * Math.PI * F2;
			const d1 = w1 + k * Math.sin(th2 - th1);
			const d2 = w2 + k * Math.sin(th1 - th2);
			th1 += d1 * dt;
			th2 += d2 * dt;
			s1.push(Math.sin(th1));
			s2.push(Math.sin(th2));
			p1.push(th1);
			p2.push(th2);
			if (s1.length > HISTORY) {
				s1.shift();
				s2.shift();
				p1.shift();
				p2.shift();
			}
		};

		const draw = () => {
			ctx.clearRect(0, 0, w, h);

			ctx.strokeStyle = colors.rule;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(0, h / 2);
			ctx.lineTo(w, h / 2);
			ctx.stroke();

			const trace = (data: number[], color: string) => {
				ctx.strokeStyle = color;
				ctx.lineWidth = 2;
				ctx.lineJoin = "round";
				ctx.beginPath();
				const dx = w / (HISTORY - 1);
				for (let i = 0; i < data.length; i++) {
					const x = i * dx;
					const y = h / 2 - data[i] * (h * 0.36);
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.stroke();
			};
			trace(s1, colors.world);
			trace(s2, colors.body);
		};

		if (reduced) {
			// Paint one settled window and stop. The readouts are computed
			// separately, so the slider still works here.
			for (let i = 0; i < HISTORY * 4; i++) step(1 / 60);
			draw();
			return () => {
				window.removeEventListener("resize", resize);
				scheme.removeEventListener("change", reread);
			};
		}

		// Warm up so the first painted frame already shows settled behaviour.
		for (let i = 0; i < HISTORY; i++) step(1 / 60);

		const tick = (now: number) => {
			const dt = Math.min(DT_CAP, (now - last) / 1000);
			last = now;
			step(dt);
			draw();
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
			scheme.removeEventListener("change", reread);
		};
	}, []);

	// Phase-difference dial.
	const dialR = 26;
	const rad = (metrics.dphi * Math.PI) / 180;

	return (
		<Figure
			label="Oscillatory family · phase locking"
			controls={
				<>
					<Slider
						label="Coupling K"
						value={K}
						min={0}
						max={5}
						step={0.05}
						onChange={setK}
						format={(v) => v.toFixed(2)}
					/>
					<Legend
						items={[
							{ key: "world", label: "Oscillator 1 — 1.00 Hz" },
							{ key: "body", label: "Oscillator 2 — 1.35 Hz" },
						]}
					/>
				</>
			}
			caption={
				<>
					Raise K slowly. Somewhere near K ≈ 1.1 the two lock — but they lock about a
					quarter cycle apart, and there PLV is near 1 while the correlation hovers
					around zero. A linear estimator would call that pair uncoupled — and it would
					be wrong. This is the whole reason the oscillatory family exists apart from
					the linear one: it asks only whether the phase relationship is{" "}
					<em>stable</em>, not whether the two rise and fall together.
				</>
			}
		>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
				<canvas
					ref={canvasRef}
					className="w-full flex-1"
					style={{ height: 170 }}
					aria-label={`Two oscillating traces. Phase-locking value ${metrics.plv.toFixed(2)}, correlation ${metrics.r.toFixed(2)}.`}
				/>
				<div className="shrink-0 self-center">
					<svg width={dialR * 2 + 8} height={dialR * 2 + 8} role="img" aria-label={`Phase difference ${Math.round(metrics.dphi)} degrees.`}>
						<g transform={`translate(${dialR + 4} ${dialR + 4})`}>
							<circle r={dialR} fill="none" stroke="currentColor" className="text-rule" strokeWidth={1} />
							<line x1={0} y1={0} x2={dialR} y2={0} stroke="currentColor" className="text-rule" strokeWidth={1} strokeDasharray="2 3" />
							<line
								x1={0}
								y1={0}
								x2={px(Math.cos(rad) * dialR)}
								y2={px(-Math.sin(rad) * dialR)}
								stroke={SERIES_COLOR.result}
								strokeWidth={2}
							/>
							<circle
								cx={px(Math.cos(rad) * dialR)}
								cy={px(-Math.sin(rad) * dialR)}
								r={3.5}
								fill={SERIES_COLOR.result}
							/>
						</g>
					</svg>
					<p className="mt-1 text-center font-sans text-[10px] uppercase tracking-[0.14em] text-muted">
						Δφ
					</p>
				</div>
			</div>

			<div className="mt-4">
				<Readout
					items={[
						{ label: "PLV", value: metrics.plv.toFixed(3), series: "result" },
						{ label: "Pearson r", value: metrics.r.toFixed(3), muted: true },
						{ label: "Phase diff", value: `${Math.round(metrics.dphi)}°`, muted: true },
					]}
				/>
			</div>
		</Figure>
	);
}
