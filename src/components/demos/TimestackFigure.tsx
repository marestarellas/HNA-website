"use client";

import { useMemo, useState } from "react";
import { Figure, Slider, Readout, SERIES_COLOR } from "./_ui";
import { FieldCanvas } from "./_FieldCanvas";
import { toPath, px } from "./_signals";
import { waveField, timestack, tracePSD } from "./_fields";

/**
 * The timestack: sample one pixel column at every frame and stack those columns
 * side by side. Space runs down the result, time runs across it, and a wave
 * passing the column becomes a visible diagonal stripe.
 *
 * Worth teaching because of how little it keeps for how much it gets. One
 * column out of a whole scene, and the wave period falls out, robustly enough
 * that heavy chop does not move the answer. Oceanographers have measured waves
 * this way from pier cameras for decades.
 */

const N = 56;
const T = 224;
const FPS = 12;
const W = 720;
const H_TRACE = 78;
const H_PSD = 110;

export function TimestackFigure() {
	const [column, setColumn] = useState(28);
	const [swell, setSwell] = useState(0.3);
	const [chop, setChop] = useState(0.4);

	const wf = useMemo(() => waveField(N, T, FPS, swell, chop), [swell, chop]);
	const ts = useMemo(() => timestack(wf, Math.round(column)), [wf, column]);
	const psd = useMemo(() => tracePSD(ts.trace, FPS), [ts]);

	// Show the spectrum only up to 2 Hz; above that is empty and would squash
	// everything interesting into the left margin.
	const shown = useMemo(() => {
		const idx = psd.freqs.map((f, i) => [f, i] as const).filter(([f]) => f <= 2);
		return {
			freqs: idx.map(([f]) => f),
			power: idx.map(([, i]) => psd.power[i]),
		};
	}, [psd]);

	const peakX = useMemo(() => {
		const i = shown.freqs.findIndex((f) => f >= psd.peakHz);
		return px((Math.max(0, i) / Math.max(1, shown.freqs.length - 1)) * W);
	}, [shown, psd.peakHz]);

	const period = psd.peakHz > 0 ? 1 / psd.peakHz : 0;
	const err = Math.abs(psd.peakHz - swell);

	return (
		<Figure
			label="Timestack · one column, read as an image of time"
			controls={
				<>
					<Slider
						label="Column"
						value={column}
						min={2}
						max={N - 3}
						step={1}
						onChange={setColumn}
						format={(v) => `x = ${Math.round(v)}`}
					/>
					<Slider
						label="Swell rate"
						value={swell}
						min={0.12}
						max={0.7}
						step={0.01}
						onChange={setSwell}
						format={(v) => `${v.toFixed(2)} Hz`}
					/>
					<Slider
						label="Chop"
						value={chop}
						min={0}
						max={1.6}
						step={0.05}
						onChange={setChop}
						format={(v) => v.toFixed(2)}
					/>
				</>
			}
			caption={
				<>
					Push the chop all the way up. The scene becomes a mess and the timestack
					keeps reporting the swell, because the chop is shorter-crested and faster,
					so it does not build a coherent stripe down a single column. Then move the
					column: the answer barely changes, since a wave passing anywhere in the
					frame passes everywhere in the frame. That insensitivity to where you look
					is what makes the method usable on real footage.
				</>
			}
		>
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="sm:w-[164px] sm:shrink-0">
					<p className="mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						The scene
					</p>
					<FieldCanvas
						field={wf.frames[0]}
						N={N}
						markColumn={Math.round(column)}
						label={`A synthetic sea surface with the sampled column marked at x equals ${Math.round(column)}.`}
						height={164}
					/>
					<p className="mt-2 font-sans text-[10px] leading-tight text-muted">
						The marked column is the only part of the frame this method reads.
					</p>
				</div>

				<div className="min-w-0 flex-1">
					<p className="mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						That column, stacked over time
					</p>
					<div className="overflow-hidden rounded-sm" style={{ height: 96 }}>
						<canvas
							ref={(el) => {
								if (!el) return;
								const ctx = el.getContext("2d");
								if (!ctx) return;
								el.width = ts.width;
								el.height = ts.height;
								const img = ctx.createImageData(ts.width, ts.height);
								const sorted = Float64Array.from(ts.image).sort();
								const lo = sorted[Math.floor(sorted.length * 0.02)];
								const hi = sorted[Math.floor(sorted.length * 0.98)];
								const span = hi - lo || 1;
								for (let i = 0; i < ts.image.length; i++) {
									const t = Math.max(0, Math.min(1, (ts.image[i] - lo) / span));
									const p = i * 4;
									// Single hue, light to dark: this is a magnitude image.
									img.data[p] = 246 - 210 * t;
									img.data[p + 1] = 244 - 190 * t;
									img.data[p + 2] = 239 - 150 * t;
									img.data[p + 3] = 255;
								}
								ctx.putImageData(img, 0, 0);
							}}
							role="img"
							aria-label="The timestack image: space down, time across, waves appearing as diagonal stripes."
							className="h-full w-full"
							style={{ imageRendering: "pixelated" }}
						/>
					</div>
					<div className="mt-1 flex justify-between font-sans text-[10px] text-muted">
						<span>time 0 s</span>
						<span>space down, time across</span>
						<span>{(T / FPS).toFixed(0)} s</span>
					</div>

					<p className="mt-4 mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						Row mean, and its spectrum
					</p>
					<svg
						viewBox={`0 0 ${W} ${H_TRACE}`}
						className="w-full"
						role="img"
						aria-label="The timestack collapsed to a single trace over time."
					>
						<path
							d={toPath(ts.trace, W, H_TRACE)}
							fill="none"
							stroke={SERIES_COLOR.result}
							strokeWidth={1.8}
						/>
					</svg>
					<svg
						viewBox={`0 0 ${W} ${H_PSD}`}
						className="w-full"
						role="img"
						aria-label={`Power spectrum of that trace, peaking at ${psd.peakHz.toFixed(2)} hertz.`}
					>
						<line
							x1={0}
							y1={H_PSD - 18}
							x2={W}
							y2={H_PSD - 18}
							stroke="currentColor"
							className="text-rule"
							strokeWidth={1}
						/>
						<path
							d={toPath(shown.power, W, H_PSD - 18, 0, Math.max(...shown.power))}
							fill="none"
							stroke={SERIES_COLOR.world}
							strokeWidth={1.8}
						/>
						<line
							x1={peakX}
							y1={0}
							x2={peakX}
							y2={H_PSD - 18}
							stroke={SERIES_COLOR.result}
							strokeWidth={1.5}
						/>
						<text
							x={Math.min(W - 70, peakX + 6)}
							y={12}
							className="fill-foreground font-sans"
							style={{ fontSize: 10 }}
						>
							peak
						</text>
						<text x={0} y={H_PSD - 5} className="fill-muted font-sans" style={{ fontSize: 10 }}>
							0 Hz
						</text>
						<text
							x={W}
							y={H_PSD - 5}
							textAnchor="end"
							className="fill-muted font-sans"
							style={{ fontSize: 10 }}
						>
							2 Hz
						</text>
					</svg>

					<div className="mt-3">
						<Readout
							items={[
								{ label: "Recovered", value: `${psd.peakHz.toFixed(2)} Hz`, series: "result" },
								{ label: "Period", value: `${period.toFixed(1)} s`, series: "result" },
								{ label: "Swell set to", value: `${swell.toFixed(2)} Hz`, muted: true },
								{ label: "Error", value: `${err.toFixed(3)} Hz`, muted: true },
							]}
						/>
					</div>
				</div>
			</div>
		</Figure>
	);
}
