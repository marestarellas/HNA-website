"use client";

import { useMemo, useState } from "react";
import { Figure, Readout, SERIES_COLOR } from "@/components/demos/_ui";
import { px } from "@/components/demos/_signals";
import { CONDITION_SUMMARY, CONDITION_LABEL, type Condition } from "./_pilot";
import { Pills, mean } from "./_parts";

/**
 * The same five people, the same recordings, measured two ways.
 *
 * Both are phase measures, and they are kept together because they are not the
 * same measure: wPLI discards the zero-lag component that a shared source
 * would produce, so when the two agree the effect is unlikely to be an
 * artefact of one of them. The pilot also ran coherence, cross-correlation and
 * mutual information, which move differently; that comparison belongs on the
 * Learn pages, where there is room to explain why.
 */

const METRICS = [
	{ id: "plv", label: "PLV" },
	{ id: "wpli", label: "wPLI" },
] as const;

type MetricId = (typeof METRICS)[number]["id"];

const ORDER: Condition[] = ["VIZ", "AUD", "MULTI"];
const W = 680;
const H = 280;
const PAD_L = 56;
const PAD_R = 16;
const PAD_T = 20;
const PAD_B = 46;

export function ConditionContrast() {
	const [metric, setMetric] = useState<MetricId>("plv");

	const { points, means, lo, hi, ratio } = useMemo(() => {
		const vals = CONDITION_SUMMARY.map((r) => r[metric]);
		const lo = Math.min(...vals);
		const hi = Math.max(...vals);
		const pad = (hi - lo) * 0.12 || 0.05;
		const means = ORDER.map((c) =>
			mean(CONDITION_SUMMARY.filter((r) => r.c === c).map((r) => r[metric]))
		);
		const subjects = [...new Set(CONDITION_SUMMARY.map((r) => r.s))];
		const points = subjects.map((s) => ({
			s,
			vals: ORDER.map(
				(c) => CONDITION_SUMMARY.find((r) => r.s === s && r.c === c)?.[metric] ?? NaN
			),
		}));
		return { points, means, lo: lo - pad, hi: hi + pad, ratio: means[1] / means[0] };
	}, [metric]);

	const x = (i: number) => px(PAD_L + (i / (ORDER.length - 1)) * (W - PAD_L - PAD_R));
	const y = (v: number) => px(H - PAD_B - ((v - lo) / (hi - lo || 1)) * (H - PAD_T - PAD_B));

	return (
		<Figure
			label="Five subjects, three ways of meeting the sea"
			controls={
				<Pills
					label="Measured by"
					items={METRICS.map((m) => ({ id: m.id, label: m.label }))}
					value={metric}
					onPick={setMetric}
				/>
			}
			caption={
				<>
					Whole-block coupling between breathing and the slow swell of the audio, one
					line per subject. Both measures ask whether the two rhythms hold a steady
					timing relationship, and both put listening well above the other two
					conditions. They are worth seeing separately because wPLI ignores the
					zero-lag part of the relationship, so agreement between them is harder to
					explain away. The sample is five people, so the group line is drawn through
					five points and nothing is hidden behind it. Source:{" "}
					<code className="font-mono text-[11px]">coupling_summary_all.csv</code>.
				</>
			}
		>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className="w-full"
				role="img"
				aria-label={`Per-subject ${metric} across the three conditions.`}
			>
				{/* axis */}
				<line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="currentColor" className="text-rule" />
				<line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="currentColor" className="text-rule" />
				{[lo, (lo + hi) / 2, hi].map((v) => (
					<g key={v}>
						<text x={PAD_L - 8} y={y(v) + 3} textAnchor="end" className="fill-muted font-sans" style={{ fontSize: 9 }}>
							{v.toFixed(2)}
						</text>
					</g>
				))}

				{/* per-subject paths */}
				{points.map((p) => (
					<g key={p.s}>
						<path
							d={p.vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(v)}`).join("")}
							fill="none"
							stroke="currentColor"
							className="text-muted"
							strokeWidth={1}
							opacity={0.45}
						/>
						{p.vals.map((v, i) => (
							<circle key={i} cx={x(i)} cy={y(v)} r={3} fill={SERIES_COLOR.body} opacity={0.75} />
						))}
						<text
							x={x(0) - 8}
							y={y(p.vals[0]) + 3}
							textAnchor="end"
							className="fill-muted font-sans"
							style={{ fontSize: 8 }}
						>
							{p.s}
						</text>
					</g>
				))}

				{/* group mean */}
				<path
					d={means.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(v)}`).join("")}
					fill="none"
					stroke={SERIES_COLOR.result}
					strokeWidth={2.5}
				/>
				{means.map((v, i) => (
					<circle key={i} cx={x(i)} cy={y(v)} r={5} fill={SERIES_COLOR.result} />
				))}

				{ORDER.map((c, i) => (
					<g key={c}>
						<text x={x(i)} y={H - PAD_B + 18} textAnchor="middle" className="fill-foreground font-sans" style={{ fontSize: 11 }}>
							{CONDITION_LABEL[c]}
						</text>
						<text x={x(i)} y={H - PAD_B + 31} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 9 }}>
							{c.toLowerCase()}
						</text>
					</g>
				))}
			</svg>

			<div className="mt-4 border-t border-rule pt-4">
				<Readout
					items={[
						{ label: "watching", value: means[0].toFixed(3), muted: true },
						{ label: "listening", value: means[1].toFixed(3), series: "result" },
						{ label: "both", value: means[2].toFixed(3), muted: true },
						{
							label: "listening ÷ watching",
							value: `${ratio.toFixed(2)}×`,
							series: ratio > 1.3 ? "result" : undefined,
							muted: ratio <= 1.3,
						},
					]}
				/>
			</div>
		</Figure>
	);
}
