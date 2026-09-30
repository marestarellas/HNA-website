"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { bgAt, inkAt, MAX_DEPTH_M } from "./_column";

/**
 * Descent.
 *
 * Scroll is depth rather than distance. The page interpolates a water column
 * as you go: light drains out of the background along a curve, fine particles
 * drift upward past you because you are the one moving down, and a gauge in
 * the margin keeps count.
 *
 * The colour of the type is switched at a threshold rather than interpolated.
 * Lerping ink from dark to cream looks correct in the abstract and produces an
 * unreadable middle, where the type and the water behind it arrive at the same
 * mid grey. Switching it, over a transition long enough to read as the light
 * going out, keeps contrast at every depth.
 */

export function DescentStage({ children }: { children: ReactNode }) {
	const stageRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const depthRef = useRef(0);
	const [depth, setDepth] = useState(0);

	/* --------------------------------------------------- depth from scroll */
	useEffect(() => {
		const stage = stageRef.current;
		if (!stage) return;

		let frame = 0;
		const read = () => {
			frame = 0;
			const span = document.documentElement.scrollHeight - window.innerHeight;
			const p = span > 0 ? Math.max(0, Math.min(1, window.scrollY / span)) : 0;
			depthRef.current = p;
			stage.style.setProperty("--depth", p.toFixed(4));
			stage.style.setProperty("--d-bg", bgAt(p));
			stage.style.setProperty("--d-ink", inkAt(p));
			setDepth(p);
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(read);
		};

		read();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, []);

	/* --------------------------------------------------- particles, rising */
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let w = 0;
		let h = 0;
		const size = () => {
			const dpr = window.devicePixelRatio || 1;
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		size();

		const motes = Array.from({ length: 110 }, () => ({
			x: Math.random() * w,
			y: Math.random() * h,
			r: 0.5 + Math.random() * 1.7,
			v: 6 + Math.random() * 20,
			sway: Math.random() * Math.PI * 2,
			swaySpeed: 0.2 + Math.random() * 0.5,
		}));

		const onResize = () => size();
		window.addEventListener("resize", onResize);

		let rush = 0;
		const draw = (dt: number) => {
			ctx.clearRect(0, 0, w, h);
			// Nothing is visible at the surface. The column has to darken before
			// anything suspended in it can catch the light.
			const vis = Math.max(0, depthRef.current - 0.12) / 0.88;
			if (vis <= 0.01) return;

			ctx.fillStyle = "#f0e7d3";
			for (const m of motes) {
				m.y -= m.v * (1 + rush * 5) * dt;
				m.sway += m.swaySpeed * dt;
				if (m.y < -4) {
					m.y = h + 4;
					m.x = Math.random() * w;
				}
				ctx.globalAlpha = vis * (0.1 + 0.28 * (m.r / 2.2));
				ctx.beginPath();
				ctx.arc(m.x + Math.sin(m.sway) * 7, m.y, m.r, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.globalAlpha = 1;
		};

		// One frame up front, so a tab that is not compositing still shows the
		// field rather than an empty canvas.
		draw(0);

		let raf = 0;
		let last = performance.now();
		let lastScroll = window.scrollY;
		const tick = (now: number) => {
			const dt = Math.min((now - last) / 1000, 0.08);
			last = now;
			const dy = window.scrollY - lastScroll;
			lastScroll = window.scrollY;
			// Scrolling fast makes the column rush past. It settles on its own.
			rush = Math.min(1, Math.abs(dy) / 60) * 0.6 + rush * 0.85;
			draw(dt);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", onResize);
		};
	}, []);

	return (
		<div
			ref={stageRef}
			className="relative min-h-screen"
			style={
				{
					"--depth": "0",
					"--d-bg": "rgb(244, 237, 224)",
					"--d-ink": "#1a1612",
					background: "var(--d-bg)",
					color: "var(--d-ink)",
					transition: "color 0.55s ease",
				} as React.CSSProperties
			}
		>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 z-0"
				style={{ background: "var(--d-bg)" }}
			/>
			<canvas
				ref={canvasRef}
				aria-hidden
				className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
			/>

			{/* Surface light thrown down from above. Gone before the halfway mark. */}
			<div
				aria-hidden
				className="pointer-events-none fixed inset-x-0 top-0 z-[1] h-[38vh]"
				style={{
					background:
						"linear-gradient(to bottom, rgba(255,250,235,0.55), rgba(255,250,235,0))",
					opacity: "calc(1 - var(--depth) * 2.1)",
				}}
			/>

			<DepthGauge depth={depth} metres={Math.round(depth * MAX_DEPTH_M)} />

			<div className="relative z-10">{children}</div>
		</div>
	);
}

/* ------------------------------------------------------------------ gauge */

function DepthGauge({ depth, metres }: { depth: number; metres: number }) {
	const ticks = [0, 20, 40, 60, 80, 100, 120];
	return (
		<div className="pointer-events-none fixed right-4 top-1/2 z-20 hidden -translate-y-1/2 md:block">
			<div className="relative h-[46vh] w-16">
				<div
					aria-hidden
					className="absolute left-0 top-0 h-full w-px"
					style={{ background: "currentColor", opacity: 0.22 }}
				/>
				{ticks.map((m) => (
					<div
						key={m}
						className="absolute left-0 flex items-center gap-2"
						style={{ top: `${(m / MAX_DEPTH_M) * 100}%`, transform: "translateY(-50%)" }}
					>
						<span
							aria-hidden
							className="block h-px w-2"
							style={{ background: "currentColor", opacity: 0.25 }}
						/>
						<span className="font-mono text-[9px] tabular-nums" style={{ opacity: 0.4 }}>
							{m}
						</span>
					</div>
				))}
				<div
					className="absolute left-0 flex items-center gap-2"
					style={{ top: `${depth * 100}%`, transform: "translateY(-50%)" }}
				>
					<span aria-hidden className="block h-px w-6" style={{ background: "#c69958" }} />
					<span className="font-mono text-[10px] tabular-nums" style={{ color: "#c69958" }}>
						{metres}m
					</span>
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------ the surface */

/**
 * The wave clip seen from underneath: flipped, thrown out of focus, blended
 * into the light rather than framed. Water is felt at the boundary instead of
 * being shown as scenery, which is the only way it can sit under type this
 * large without competing with it.
 */
export function SurfaceVideo() {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(120% 80% at 50% 0%, rgba(255,250,235,0.7), rgba(244,237,224,0) 70%)",
				}}
			/>
		);
	}

	return (
		<div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
			<video
				src="/learn/video/waves.mp4"
				autoPlay
				muted
				loop
				playsInline
				onError={() => setFailed(true)}
				className="h-full w-full object-cover"
				style={{
					transform: "scaleY(-1)",
					filter: "blur(14px) saturate(0.65) brightness(1.15)",
					opacity: 0.5,
					mixBlendMode: "luminosity",
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(to bottom, rgba(244,237,224,0.15) 0%, rgba(244,237,224,0.55) 55%, var(--d-bg) 100%)",
				}}
			/>
		</div>
	);
}
