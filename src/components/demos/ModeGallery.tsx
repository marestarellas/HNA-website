"use client";

import { useEffect, useRef, useState } from "react";
import { Figure, Readout } from "./_ui";
import { SHOWCASE_CLIPS } from "./_showcase";

/**
 * The real spatial modes, from real footage, breathing at their real
 * frequencies.
 *
 * The showcase renders these as three-dimensional meshes with a displacement
 * map. Here the same height field is drawn as a ridge plot on a plain canvas:
 * every row of the mode becomes a profile line, offset and scaled, so the
 * surface reads without pulling in a 3-D engine for one figure. The amplitude
 * oscillates at the frequency the pipeline measured for that mode, so a
 * high-frequency mode visibly flutters where a low one swells.
 *
 * The mode images are the pipeline's own output: 4 KB greyscale arrays where
 * the value at each point is that point's weight in the mode. They are
 * colourised here rather than shipped pre-coloured, which keeps them a
 * hundredth of the size and lets them follow the site's palette.
 */

const CLIPS = SHOWCASE_CLIPS.map((c, i) => ({
	...c,
	// How many mode images were exported for this clip.
	modeCount: i === 0 ? 3 : 4,
	label: ["Clip one", "Clip two", "Clip three", "Clip four"][i],
}));

const ROWS = 34; // profile lines drawn
const COLS = 56; // samples per line

function useHeightField(src: string) {
	const [field, setField] = useState<Float32Array | null>(null);

	useEffect(() => {
		let cancelled = false;
		const img = new Image();
		img.onload = () => {
			if (cancelled) return;
			const c = document.createElement("canvas");
			c.width = COLS;
			c.height = ROWS;
			const ctx = c.getContext("2d", { willReadFrequently: true });
			if (!ctx) return;
			ctx.drawImage(img, 0, 0, COLS, ROWS);
			const d = ctx.getImageData(0, 0, COLS, ROWS).data;
			const f = new Float32Array(COLS * ROWS);
			for (let i = 0; i < COLS * ROWS; i++) {
				const p = i * 4;
				f[i] = (0.2126 * d[p] + 0.7152 * d[p + 1] + 0.0722 * d[p + 2]) / 255 - 0.5;
			}
			setField(f);
		};
		img.onerror = () => setField(null);
		img.src = src;
		return () => {
			cancelled = true;
		};
	}, [src]);

	return field;
}

function ModeSurface({
	src,
	freqHz,
	accent,
	label,
}: {
	src: string;
	freqHz: number;
	accent: string;
	label: string;
}) {
	const field = useHeightField(src);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !field) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		const colour = () => {
			const cs = getComputedStyle(canvas);
			return {
				ink: cs.getPropertyValue(accent).trim() || "#3070CC",
				bg: cs.getPropertyValue("--background").trim() || "#f6f4ef",
			};
		};

		let raf = 0;
		const start = performance.now();

		const draw = (amp: number) => {
			const dpr = window.devicePixelRatio || 1;
			const w = canvas.clientWidth;
			const h = canvas.clientHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, w, h);

			const C = colour();
			const padX = w * 0.06;
			const usableW = w - padX * 2;
			const rowStep = (h * 0.62) / (ROWS - 1);
			const yTop = h * 0.2;
			const relief = h * 0.26 * amp;

			// Back to front, so nearer profiles occlude farther ones.
			for (let r = ROWS - 1; r >= 0; r--) {
				const depth = r / (ROWS - 1);
				const shrink = 0.72 + 0.28 * depth; // simple perspective
				const x0 = padX + (usableW * (1 - shrink)) / 2;
				const baseY = yTop + r * rowStep;

				ctx.beginPath();
				for (let c = 0; c < COLS; c++) {
					const x = x0 + (c / (COLS - 1)) * usableW * shrink;
					const y = baseY - field[r * COLS + c] * relief;
					if (c === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				// Fill under the profile with the background so lines behind are hidden.
				ctx.lineTo(x0 + usableW * shrink, baseY + rowStep * 2);
				ctx.lineTo(x0, baseY + rowStep * 2);
				ctx.closePath();
				ctx.fillStyle = C.bg;
				ctx.fill();

				ctx.beginPath();
				for (let c = 0; c < COLS; c++) {
					const x = x0 + (c / (COLS - 1)) * usableW * shrink;
					const y = baseY - field[r * COLS + c] * relief;
					if (c === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.strokeStyle = C.ink;
				ctx.globalAlpha = 0.25 + 0.75 * depth;
				ctx.lineWidth = 1.1;
				ctx.stroke();
				ctx.globalAlpha = 1;
			}
		};

		// Paint once, synchronously, before handing over to the animation loop.
		// requestAnimationFrame does not run while a page is not compositing, and
		// a surface that only ever draws from inside the loop shows nothing at all
		// in that case. It also removes a blank first frame in the normal case.
		draw(1);

		if (reduced) return;

		const tick = (now: number) => {
			const t = (now - start) / 1000;
			// Breathe at the mode's own measured frequency, kept off zero so the
			// surface never collapses to a flat plane at a zero crossing.
			const amp = 0.45 + 0.55 * Math.cos(2 * Math.PI * freqHz * t);
			draw(amp);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [field, freqHz, accent]);

	return (
		<canvas
			ref={canvasRef}
			className="w-full"
			style={{ height: 130 }}
			role="img"
			aria-label={label}
		/>
	);
}

const ACCENTS = ["--fam-linear", "--fam-oscillatory", "--fam-information", "--fam-complexity"];

export function ModeGallery() {
	const [clipIndex, setClipIndex] = useState(2);
	const clip = CLIPS[clipIndex];

	return (
		<Figure
			label="Spatial modes, breathing at their own frequencies"
			controls={
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
					<span className="w-16 shrink-0 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						Clip
					</span>
					<div className="flex flex-wrap gap-2">
						{CLIPS.map((c, i) => (
							<button
								key={c.name}
								type="button"
								onClick={() => setClipIndex(i)}
								aria-pressed={clipIndex === i}
								className={[
									"rounded-full border px-3 py-1 font-sans text-[11px] transition-colors",
									clipIndex === i
										? "border-foreground bg-foreground text-background"
										: "border-rule text-muted hover:text-foreground",
								].join(" ")}
							>
								{c.label}
							</button>
						))}
					</div>
				</div>
			}
			caption={
				<>
					Each surface is a mode image from the analysis pipeline: a greyscale array
					whose value at every point is that point&rsquo;s weight in the mode, drawn here
					as a relief and oscillating at the frequency the decomposition found for it.
					Compare clips. An ordered sea gives smooth low-frequency modes with long
					crests; a broken one gives busier modes at higher frequencies. The
					percentages say how much of the clip each mode accounts for.
				</>
			}
		>
			<div className="grid gap-4 sm:grid-cols-2">
				{Array.from({ length: clip.modeCount }, (_, i) => {
					const freq = clip.modalFreqsHz[i] ?? 0;
					const energy = clip.modalEnergies[i] ?? 0;
					return (
						<div key={i}>
							<div className="flex items-baseline justify-between">
								<p
									className="font-sans text-[10px] uppercase tracking-[0.16em]"
									style={{ color: `var(${ACCENTS[i % 4]})` }}
								>
									Mode {i + 1}
								</p>
								<p className="font-sans text-[11px] tabular-nums text-muted">
									{freq.toFixed(2)} Hz · {(energy * 100).toFixed(0)}%
								</p>
							</div>
							<ModeSurface
								src={`/learn/modes/${clip.name}_mode_${i + 1}.png`}
								freqHz={Math.max(0.08, Math.min(1.6, freq))}
								accent={ACCENTS[i % 4]}
								label={`Spatial mode ${i + 1} of ${clip.label}, oscillating at ${freq.toFixed(2)} hertz.`}
							/>
						</div>
					);
				})}
			</div>

			<div className="mt-4 border-t border-rule pt-4">
				<Readout
					items={[
						{ label: "Clip", value: clip.name, muted: true },
						{ label: "Timestack peak", value: `${clip.timestackPeakHz.toFixed(2)} Hz`, series: "result" },
						{ label: "Modes exported", value: String(clip.modeCount), muted: true },
					]}
				/>
			</div>
		</Figure>
	);
}
