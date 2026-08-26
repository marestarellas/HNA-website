"use client";

import { useState } from "react";
import { Figure, SERIES_COLOR } from "./_ui";
import { SHOWCASE_CLIPS } from "./_showcase";

/**
 * Four different seas, one pipeline, and the numbers that separate them.
 *
 * Every value here was measured by the Python toolbox from real footage. The
 * argument the figure exists to make is that measures which were never told
 * what water is, and have no idea what a wave looks like, nonetheless sort
 * these clips in the way a person would.
 *
 * The per-pixel frequency map is the striking one. Nobody labelled the surf
 * zone; a spectrum was run down every pixel's own time series and the map drew
 * itself.
 */

const METRICS = [
	{
		key: "timestackPeakHz" as const,
		label: "Wave frequency",
		help: "from the timestack",
		unit: " Hz",
		digits: 2,
	},
	{
		key: "pixelSyncIndex" as const,
		label: "Pixel synchrony",
		help: "how much of the frame oscillates together",
		unit: "",
		digits: 3,
	},
	{
		key: "pixelCoherenceIndex" as const,
		label: "Pixel coherence",
		help: "how consistent each pixel's own rhythm is",
		unit: "",
		digits: 3,
	},
];

const LABELS = ["Clip one", "Clip two", "Clip three", "Clip four"];
const ACCENTS = ["--fam-linear", "--fam-oscillatory", "--fam-information", "--fam-complexity"];

export function FourSeas() {
	const [metric, setMetric] = useState<(typeof METRICS)[number]["key"]>("pixelSyncIndex");
	const active = METRICS.find((m) => m.key === metric)!;
	const values = SHOWCASE_CLIPS.map((c) => c[metric]);
	const max = Math.max(...values) || 1;

	return (
		<Figure
			label="Four seas · the same pipeline, four sets of numbers"
			controls={
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
					<span className="w-16 shrink-0 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						Measure
					</span>
					<div className="flex flex-wrap gap-2">
						{METRICS.map((m) => (
							<button
								key={m.key}
								type="button"
								onClick={() => setMetric(m.key)}
								aria-pressed={metric === m.key}
								className={[
									"rounded-full border px-3 py-1 font-sans text-[11px] transition-colors",
									metric === m.key
										? "border-foreground bg-foreground text-background"
										: "border-rule text-muted hover:text-foreground",
								].join(" ")}
							>
								{m.label}
							</button>
						))}
					</div>
				</div>
			}
			caption={
				<>
					Pixel synchrony is the measure worth dwelling on. It runs from 0.14 to 0.55
					across these four clips, and it is asking a question no single trace can:
					not how fast the water moves, but how much of the frame moves{" "}
					<em>together</em>. A long ordered swell scores high because the whole
					surface rises and falls as one. A broken sea scores low because every part
					of it is doing something different. Below each clip is its per-pixel
					frequency map, where the value at each point is that point&rsquo;s own
					dominant frequency. Nobody drew the surf zone; the measurement found it.
				</>
			}
		>
			<p className="mb-2 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
				{active.label} · {active.help}
			</p>
			<div className="space-y-2">
				{SHOWCASE_CLIPS.map((c, i) => {
					const v = c[metric];
					return (
						<div key={c.name} className="flex items-center gap-3">
							<span className="w-20 shrink-0 font-sans text-[11px] text-muted">
								{LABELS[i]}
							</span>
							<div className="h-4 flex-1 rounded-[2px] bg-foreground/[0.05]">
								<div
									className="h-full rounded-[2px]"
									style={{
										width: `${Math.max(2, (v / max) * 100)}%`,
										background: `var(${ACCENTS[i]})`,
									}}
								/>
							</div>
							<span className="w-20 shrink-0 text-right font-sans text-[12px] tabular-nums text-foreground">
								{v.toFixed(active.digits)}
								{active.unit}
							</span>
						</div>
					);
				})}
			</div>

			<div className="mt-6 grid gap-4 sm:grid-cols-4">
				{SHOWCASE_CLIPS.map((c, i) => (
					<div key={c.name}>
						<p
							className="mb-1 font-sans text-[10px] uppercase tracking-[0.16em]"
							style={{ color: `var(${ACCENTS[i]})` }}
						>
							{LABELS[i]}
						</p>
						{/* The pipeline's own per-pixel dominant-frequency map. */}
						<img
							src={`/learn/modes/${c.name}_peak_freq_map.png`}
							alt={`Per-pixel dominant frequency map for ${LABELS[i].toLowerCase()}. Brighter areas oscillate faster.`}
							className="w-full rounded-sm"
							style={{ imageRendering: "auto" }}
							loading="lazy"
						/>
						<p className="mt-1 font-sans text-[10px] leading-tight text-muted">
							{c.timestackPeakHz.toFixed(2)} Hz · sync {c.pixelSyncIndex.toFixed(2)}
						</p>
					</div>
				))}
			</div>

			<div className="mt-5 border-t border-rule pt-4">
				<p className="mb-2 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
					Modal spectra · where each clip puts its energy
				</p>
				<div className="grid gap-3 sm:grid-cols-4">
					{SHOWCASE_CLIPS.map((c, i) => (
						<div key={c.name}>
							<svg viewBox="0 0 120 54" className="w-full" role="img" aria-label={`Modal frequencies and energies for ${LABELS[i].toLowerCase()}.`}>
								<line x1={0} y1={46} x2={120} y2={46} stroke="currentColor" className="text-rule" strokeWidth={1} />
								{c.modalFreqsHz.map((f, j) => {
									const maxF = 3;
									const x = Math.min(116, (f / maxF) * 116) + 2;
									const e = c.modalEnergies[j] ?? 0;
									return (
										<line
											key={j}
											x1={x}
											y1={46}
											x2={x}
											y2={46 - e * 40}
											stroke={`var(${ACCENTS[i]})`}
											strokeWidth={3}
											strokeLinecap="round"
										/>
									);
								})}
								<text x={0} y={53} className="fill-muted font-sans" style={{ fontSize: 7 }}>0</text>
								<text x={120} y={53} textAnchor="end" className="fill-muted font-sans" style={{ fontSize: 7 }}>3 Hz</text>
							</svg>
						</div>
					))}
				</div>
			</div>
		</Figure>
	);
}
