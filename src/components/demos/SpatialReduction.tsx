"use client";

import { useMemo, useState } from "react";
import { Figure, Legend, Slider, Readout, Baseline, SERIES_COLOR } from "./_ui";
import { FieldCanvas } from "./_FieldCanvas";
import { toPath, px } from "./_signals";
import {
	waveField,
	wholeImageTrace,
	frameDifferenceTrace,
	patchTrace,
	pixelTrace,
	tracePSD,
} from "./_fields";

/**
 * The first figure of the page: a scene is a block of numbers, and it has to
 * become one number per frame before anything can be measured against it.
 *
 * Four reductions of the same clip, chosen so the reader can watch the answer
 * change with the choice rather than being told it does. Two of them teach
 * something uncomfortable:
 *
 *   whole-image averaging nearly cancels a travelling wave, because as many
 *   crests leave the frame as enter it. The trace goes almost flat. That is not
 *   a bug in the method, it is the reason the finer tiers exist.
 *
 *   frame difference peaks at twice the wave frequency, because it is a
 *   rectifier: it does not care whether the surface is rising or falling, only
 *   that it moved.
 */

const N = 48;
const T = 160;
const FPS = 12;
const W = 720;
const H = 96;

type Mode = "whole" | "diff" | "patch" | "pixel";

const MODES: { id: Mode; label: string }[] = [
	{ id: "whole", label: "Whole image" },
	{ id: "diff", label: "Frame difference" },
	{ id: "patch", label: "One patch" },
	{ id: "pixel", label: "One pixel" },
];

const COPY: Record<Mode, { tier: string; note: React.ReactNode }> = {
	whole: {
		tier: "Whole-image tier · raw family",
		note: (
			<>
				Average the brightness of every pixel and you get one number per frame, which
				is the cheapest reduction there is. Notice how little it moves. A travelling
				wave brings as many crests into the frame as it takes out, so averaging over
				the whole scene very nearly cancels it. The trace is not broken; it is telling
				you that this measure is close to blind to this kind of motion, and that is the
				reason the finer tiers exist at all.
			</>
		),
	},
	diff: {
		tier: "Whole-image tier · raw family",
		note: (
			<>
				How much changed since the last frame. This one moves, but read the frequency
				carefully: it peaks at <em>twice</em> the wave frequency. Frame difference is a
				rectifier, indifferent to whether the surface is rising or falling and
				sensitive only to the fact that it moved, so each wave registers twice per
				cycle. Useful, and a trap if you take the peak at face value.
			</>
		),
	},
	patch: {
		tier: "Per-patch tier · raw family",
		note: (
			<>
				Tile the frame and average within one tile only. Small enough that the wave no
				longer cancels, large enough to be steadier than any single pixel. Most of the
				practical middle ground lives here, and the tile size is a real parameter: too
				big and you are back to the whole image, too small and you are back to noise.
			</>
		),
	},
	pixel: {
		tier: "Per-pixel tier · raw family",
		note: (
			<>
				One pixel, watched over time. The cleanest oscillation of the four, and the
				most fragile: a different pixel gives a different phase, and a pixel that
				happens to sit on a node gives you almost nothing. In practice every pixel is
				analysed and the results become a map rather than a trace.
			</>
		),
	},
};

export function SpatialReduction() {
	const [mode, setMode] = useState<Mode>("whole");
	const [swell, setSwell] = useState(0.3);

	const wf = useMemo(() => waveField(N, T, FPS, swell, 0.4), [swell]);

	const trace = useMemo(() => {
		if (mode === "diff") return frameDifferenceTrace(wf.frames);
		if (mode === "patch") return patchTrace(wf.frames, N, 4, 1, 2);
		if (mode === "pixel") return pixelTrace(wf.frames, N, 20, 24);
		return wholeImageTrace(wf.frames);
	}, [wf, mode]);

	const peak = useMemo(() => tracePSD(trace, FPS, 0.05, 4).peakHz, [trace]);
	const lo = Math.min(...trace);
	const hi = Math.max(...trace);
	const spread = hi - lo;

	return (
		<Figure
			label="A scene is not a signal · four reductions of one clip"
			controls={
				<>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
						<span className="w-20 shrink-0 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
							Reduce by
						</span>
						<div className="flex flex-wrap gap-2">
							{MODES.map((m) => (
								<button
									key={m.id}
									type="button"
									onClick={() => setMode(m.id)}
									aria-pressed={mode === m.id}
									className={[
										"rounded-full border px-3 py-1 font-sans text-[11px] transition-colors",
										mode === m.id
											? "border-foreground bg-foreground text-background"
											: "border-rule text-muted hover:text-foreground",
									].join(" ")}
								>
									{m.label}
								</button>
							))}
						</div>
					</div>
					<Slider
						label="Swell rate"
						value={swell}
						min={0.1}
						max={0.7}
						step={0.01}
						onChange={setSwell}
						format={(v) => `${v.toFixed(2)} Hz`}
					/>
					<Legend
						items={[
							{ key: "world", label: "Crest" },
							{ key: "body", label: "Trough" },
							{ key: "result", label: "The extracted trace" },
						]}
					/>
				</>
			}
			caption={COPY[mode].note}
		>
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="sm:w-[168px] sm:shrink-0">
					<p className="mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						One frame
					</p>
					<FieldCanvas
						field={wf.frames[0]}
						N={N}
						label={`A synthetic sea surface, swell at ${swell.toFixed(2)} hertz.`}
						height={168}
					/>
					<p className="mt-2 font-sans text-[10px] leading-tight text-muted">
						{COPY[mode].tier}
					</p>
				</div>

				<div className="min-w-0 flex-1">
					<p className="mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						One number per frame
					</p>
					<svg
						viewBox={`0 0 ${W} ${H}`}
						className="w-full"
						role="img"
						aria-label={`The ${mode} reduction as a trace over time, peaking at ${peak.toFixed(2)} hertz.`}
					>
						<Baseline width={W} y={H / 2} />
						<path
							d={toPath(trace, W, H, lo, hi)}
							fill="none"
							stroke={SERIES_COLOR.result}
							strokeWidth={2}
						/>
					</svg>
					<div className="mt-3">
						<Readout
							items={[
								{ label: "Trace peak", value: `${peak.toFixed(2)} Hz`, series: "result" },
								{ label: "Swell set to", value: `${swell.toFixed(2)} Hz`, muted: true },
								{
									label: "Range",
									value: spread < 0.05 ? spread.toFixed(4) : spread.toFixed(2),
									muted: true,
								},
							]}
						/>
					</div>
					{mode === "diff" && (
						<p className="mt-3 font-sans text-xs leading-relaxed text-muted">
							Peak is close to twice the swell. That is the rectifier at work, not an
							error.
						</p>
					)}
					{mode === "whole" && spread < 0.05 && (
						<p className="mt-3 font-sans text-xs leading-relaxed text-muted">
							Range is tiny. The plot is auto-scaled, so this is a very small
							variation drawn large.
						</p>
					)}
				</div>
			</div>
		</Figure>
	);
}
