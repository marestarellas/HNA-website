"use client";

import { useMemo, useState } from "react";
import { Figure, Readout, SERIES_COLOR } from "@/components/demos/_ui";
import { px } from "@/components/demos/_signals";
import { NATURE_VS_REST } from "./_pilot";
import { Pills } from "./_parts";

/**
 * The nature-versus-rest contrasts, on the two phase measures.
 *
 * The pilot ran twelve of these in total, four metrics against three
 * physiological derivations. This shows the six that use PLV and wPLI, which
 * keeps the figure readable; the caption says how many were run in total,
 * because how many comparisons were made is part of what a p-value means and
 * dropping it from the figure should not drop it from the page.
 */

const MODALITY_LABEL: Record<string, string> = {
	resp: "breathing",
	hrv_meannn: "heart, mean interval",
	hrv_meannn_swell_0p1: "heart, slowest swell",
};

const METRIC_LABEL: Record<string, string> = {
	plv: "PLV",
	wpli: "wPLI",
	coh_band_avg: "coherence",
	xcorr_peak_r: "cross-correlation",
};

const FILTERS = [
	{ id: "all", label: "everything" },
	{ id: "resp", label: "breathing" },
	{ id: "heart", label: "heart" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const W = 680;
const ROW_H = 26;
const PAD_L = 210;
const PAD_R = 64;
const PAD_T = 26;

export function NatureVsRest() {
	const [filter, setFilter] = useState<FilterId>("all");

	const { rows, span, nSig } = useMemo(() => {
		const phase = NATURE_VS_REST.filter((r) => r.m === "plv" || r.m === "wpli");
		const rows = phase.filter((r) =>
			filter === "all" ? true : filter === "resp" ? r.mod === "resp" : r.mod !== "resp"
		);
		const span = Math.max(...phase.map((r) => Math.abs(r.lmmBeta))) * 1.15;
		return { rows, span, nSig: rows.filter((r) => r.lmmP < 0.05).length };
	}, [filter]);

	const H = PAD_T + rows.length * ROW_H + 34;
	const zero = px(PAD_L + (W - PAD_L - PAD_R) / 2);
	const x = (b: number) => px(zero + (b / span) * ((W - PAD_L - PAD_R) / 2));

	return (
		<Figure
			label="Nature versus rest, on the two phase measures"
			controls={
				<Pills label="Show" items={FILTERS.map((f) => ({ id: f.id, label: f.label }))} value={filter} onPick={setFilter} />
			}
			caption={
				<>
					Each row compares the three nature blocks against the two silent rests, as
					a linear mixed-effects model on the windowed values with a per-subject
					random intercept, over roughly 440 windows. Dots right of the line mean
					more coupling during nature, filled ones are p&nbsp;&lt;&nbsp;0.05. The
					pilot ran twelve such contrasts across four metrics; these are the six
					using the two phase measures, and none of the p-values are corrected for
					the twelve. Read the rows for direction and confidence rather than
					comparing their lengths. Source:{" "}
					<code className="font-mono text-[11px]">nature_vs_rest_stats.csv</code>.
				</>
			}
		>
			<svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Forest plot of twelve nature versus rest contrasts.">
				<line x1={zero} y1={PAD_T - 10} x2={zero} y2={PAD_T + rows.length * ROW_H} stroke="currentColor" className="text-rule" />
				<text x={zero} y={PAD_T - 16} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 9 }}>
					no difference
				</text>
				<text x={zero - 70} y={PAD_T + rows.length * ROW_H + 22} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 9 }}>
					&larr; more at rest
				</text>
				<text x={zero + 70} y={PAD_T + rows.length * ROW_H + 22} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 9 }}>
					more in nature &rarr;
				</text>

				{rows.map((r, i) => {
					const cy = px(PAD_T + i * ROW_H + ROW_H / 2);
					const sig = r.lmmP < 0.05;
					const trend = !sig && r.lmmP < 0.1;
					const colour = sig ? SERIES_COLOR.result : trend ? SERIES_COLOR.body : "#9a948a";
					return (
						<g key={`${r.mod}-${r.m}`}>
							<text x={8} y={cy + 3} className="fill-muted font-sans" style={{ fontSize: 10 }}>
								{MODALITY_LABEL[r.mod] ?? r.mod}
							</text>
							<text x={PAD_L - 10} y={cy + 3} textAnchor="end" className="fill-foreground font-sans" style={{ fontSize: 10 }}>
								{METRIC_LABEL[r.m] ?? r.m}
							</text>
							<line x1={zero} y1={cy} x2={x(r.lmmBeta)} y2={cy} stroke={colour} strokeWidth={1.5} opacity={0.5} />
							<circle
								cx={x(r.lmmBeta)}
								cy={cy}
								r={4.5}
								fill={sig ? colour : "var(--background)"}
								stroke={colour}
								strokeWidth={1.6}
							/>
							<text
								x={W - PAD_R + 8}
								y={cy + 3}
								className="font-sans tabular-nums"
								style={{ fontSize: 10, fill: sig ? colour : undefined }}
							>
								<tspan className={sig ? "" : "fill-muted"}>{r.lmmP < 0.001 ? "<0.001" : r.lmmP.toFixed(3)}</tspan>
							</text>
						</g>
					);
				})}
			</svg>

			<div className="mt-4 border-t border-rule pt-4">
				<Readout
					items={[
						{ label: "shown", value: String(rows.length), muted: true },
						{ label: "p < 0.05", value: String(nSig), series: "result" },
						{ label: "run in total", value: "12", muted: true },
						{ label: "corrected", value: "no", muted: true },
						{ label: "subjects", value: "5", muted: true },
					]}
				/>
			</div>
		</Figure>
	);
}
