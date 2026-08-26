"use client";

import { useState } from "react";
import { Figure } from "./_ui";
import { SHOWCASE_CLIPS } from "./_showcase";

/**
 * Four clips, one pipeline, laid out as four columns so a reader compares down
 * a clip rather than across three separate widgets.
 *
 * Everything for a given sea sits in its own column: what its pixels oscillate
 * at, the leading spatial pattern, where its modal energy falls, and the three
 * numbers. The selected measure is highlighted across all four so the ranking
 * is visible at a glance without losing the context around it.
 */

const METRICS = [
	{
		key: "timestackPeakHz" as const,
		label: "Wave frequency",
		help: "how often a wave passes a fixed line",
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
		help: "how steady each pixel's own rhythm is",
		unit: "",
		digits: 3,
	},
];

const LABELS = ["Clip one", "Clip two", "Clip three", "Clip four"];
const ACCENTS = ["--fam-linear", "--fam-oscillatory", "--fam-information", "--fam-complexity"];
const CHARACTER = [
	"broken, fast, scattered",
	"long swell, moderately organised",
	"the most organised of the four",
	"broken and fast, like clip one",
];

export function FourSeas() {
	const [metric, setMetric] = useState<(typeof METRICS)[number]["key"]>("pixelSyncIndex");
	const active = METRICS.find((m) => m.key === metric)!;
	const values = SHOWCASE_CLIPS.map((c) => c[metric]);
	const max = Math.max(...values) || 1;

	return (
		<Figure
			label="Four clips, four sets of numbers"
			controls={
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
					<span className="w-16 shrink-0 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						Compare
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
					across these four and asks something no single trace can: not how fast the
					water moves, but how much of the frame moves <em>together</em>. A long
					ordered swell scores high because the whole surface rises and falls as one; a
					broken sea scores low because every part of it is doing something else. The
					frequency maps make the same point visually, since each point&rsquo;s colour
					is its own dominant frequency and an organised sea produces a calmer map.
				</>
			}
		>
			<p className="mb-3 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
				{active.label} · {active.help}
			</p>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{SHOWCASE_CLIPS.map((c, i) => {
					const v = c[metric];
					const token = ACCENTS[i];
					const isTop = v === max;
					return (
						<div key={c.name} className="min-w-0">
							{/* 1. identity */}
							<p
								className="font-sans text-[10px] uppercase tracking-[0.16em]"
								style={{ color: `var(${token})` }}
							>
								{LABELS[i]}
							</p>
							<p className="mt-0.5 font-sans text-[10px] leading-tight text-muted">
								{CHARACTER[i]}
							</p>

							{/* 2. the selected measure, large, with a bar for ranking */}
							<p
								className="mt-3 font-sans text-2xl leading-none tabular-nums"
								style={{ color: isTop ? `var(${token})` : undefined }}
							>
								<span className={isTop ? "" : "text-foreground"}>
									{v.toFixed(active.digits)}
									<span className="text-sm text-muted">{active.unit}</span>
								</span>
							</p>
							<div className="mt-1.5 h-1.5 rounded-full bg-foreground/[0.07]">
								<div
									className="h-full rounded-full"
									style={{
										width: `${Math.max(3, (v / max) * 100)}%`,
										background: `var(${token})`,
									}}
								/>
							</div>

							{/* 3. per-pixel frequency map */}
							<p className="mt-4 font-sans text-[9px] uppercase tracking-[0.14em] text-muted">
								Frequency per pixel
							</p>
							<img
								src={`/learn/modes/${c.name}_peak_freq_map.png`}
								alt={`Map of the dominant frequency at each pixel for ${LABELS[i].toLowerCase()}. Colour is frequency, not brightness.`}
								className="mt-1 w-full rounded-sm"
							/>

							{/* 4. leading spatial pattern */}
							<p className="mt-3 font-sans text-[9px] uppercase tracking-[0.14em] text-muted">
								Leading pattern
							</p>
							<img
								src={`/learn/modes/${c.name}_mode_1.png`}
								alt={`The leading spatial mode of ${LABELS[i].toLowerCase()}.`}
								className="mt-1 w-full rounded-sm"
								style={{ imageRendering: "pixelated" }}
							/>

							{/* 5. where its energy falls */}
							<p className="mt-3 font-sans text-[9px] uppercase tracking-[0.14em] text-muted">
								Modal energy
							</p>
							<svg
								viewBox="0 0 120 40"
								className="mt-1 w-full"
								role="img"
								aria-label={`Modal frequencies and energies for ${LABELS[i].toLowerCase()}.`}
							>
								<line x1={0} y1={34} x2={120} y2={34} stroke="currentColor" className="text-rule" strokeWidth={1} />
								{c.modalFreqsHz.map((f, j) => {
									const x = Math.min(116, (f / 3) * 116) + 2;
									const e = c.modalEnergies[j] ?? 0;
									return (
										<line
											key={j}
											x1={x}
											y1={34}
											x2={x}
											y2={34 - e * 28}
											stroke={`var(${token})`}
											strokeWidth={3}
											strokeLinecap="round"
										/>
									);
								})}
								<text x={0} y={40} className="fill-muted font-sans" style={{ fontSize: 7 }}>0</text>
								<text x={120} y={40} textAnchor="end" className="fill-muted font-sans" style={{ fontSize: 7 }}>3 Hz</text>
							</svg>

							{/* 6. the other two numbers, small */}
							<dl className="mt-3 space-y-0.5 border-t border-rule pt-2">
								{METRICS.filter((m) => m.key !== metric).map((m) => (
									<div key={m.key} className="flex justify-between gap-2">
										<dt className="font-sans text-[10px] text-muted">{m.label}</dt>
										<dd className="font-sans text-[10px] tabular-nums text-foreground">
											{c[m.key].toFixed(m.digits)}
											{m.unit}
										</dd>
									</div>
								))}
							</dl>
						</div>
					);
				})}
			</div>
		</Figure>
	);
}
