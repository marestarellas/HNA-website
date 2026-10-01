"use client";

import { useMemo, useState } from "react";
import { Figure, Readout, SERIES_COLOR } from "@/components/demos/_ui";
import { px } from "@/components/demos/_signals";
import { SURROGATE, type Block } from "./_pilot";
import { Pills } from "./_parts";

/**
 * The question the pilot cannot answer, asked anyway.
 *
 * Everything else on this page is a difference: more coupling here than there.
 * Those differences are real and they survive a model. This figure asks the
 * other question, whether the coupling is above what you would get from
 * nothing at all, by shuffling the phases of the audio and recomputing. The
 * answer is mostly no.
 *
 * That is not a failure, it is the expected result at this size: five people,
 * blocks of a few minutes, and a swell near 0.1 Hz give only a handful of
 * independent cycles to measure. The report says as much, and defers surrogate
 * testing to the larger study for exactly this reason. Putting it on the page
 * keeps a reader from carrying away a stronger claim than the data makes.
 */

const METRICS = [
	{ id: "plv", label: "PLV" },
	{ id: "wpli", label: "wPLI" },
	{ id: "coh_band_avg", label: "coherence" },
] as const;

type MetricId = (typeof METRICS)[number]["id"];

const BLOCKS: Block[] = ["RS1", "VIZ", "AUD", "MULTI", "RS2"];
const BLOCK_LABEL: Record<Block, string> = {
	RS1: "rest, before",
	VIZ: "watching",
	AUD: "listening",
	MULTI: "both",
	RS2: "rest, after",
};

const W = 680;
const ROW_H = 20;
const GROUP_GAP = 14;
const PAD_L = 104;
const PAD_R = 20;
const PAD_T = 24;

export function SurrogateNull() {
	const [metric, setMetric] = useState<MetricId>("plv");

	const { groups, lo, hi, above, total } = useMemo(() => {
		const rows = SURROGATE.filter((r) => r.m === metric);
		const lo = Math.min(...rows.map((r) => Math.min(r.obs, r.lo))) * 0.95;
		const hi = Math.max(...rows.map((r) => Math.max(r.obs, r.hi))) * 1.05;
		// Each block's vertical offset is the sum of the blocks above it, worked
		// out from the data rather than accumulated in a counter. A counter
		// advanced while rendering lays the figure out differently on a re-render
		// that starts from a stale value.
		const rowsIn = (b: Block) =>
			rows.filter((r) => r.c === b).sort((x, y) => x.s - y.s);
		const groups = BLOCKS.map((b, i) => ({
			block: b,
			top:
				PAD_T +
				BLOCKS.slice(0, i).reduce(
					(sum, above) => sum + rowsIn(above).length * ROW_H + GROUP_GAP,
					0
				),
			rows: rowsIn(b),
		}));
		return { groups, lo, hi, above: rows.filter((r) => r.obs > r.hi).length, total: rows.length };
	}, [metric]);

	const x = (v: number) => px(PAD_L + ((v - lo) / (hi - lo || 1)) * (W - PAD_L - PAD_R));
	const nRows = groups.reduce((s, g) => s + g.rows.length, 0);
	const H = PAD_T + nRows * ROW_H + groups.length * GROUP_GAP + 16;

	return (
		<Figure
			label="Measured against a null that has no coupling in it"
			controls={
				<Pills label="Metric" items={METRICS.map((m) => ({ id: m.id, label: m.label }))} value={metric} onPick={setMetric} />
			}
			caption={
				<>
					For every subject and every block, the audio&rsquo;s phases were shuffled and
					the coupling recomputed many times to build a null. The grey bar is the
					middle 95% of that null and the dot is what was actually measured. A dot
					inside the bar is a value that shuffled audio produces just as easily.
					Almost all of them are. This is the expected result at five subjects with
					blocks of a few minutes, because a swell near 0.1&nbsp;Hz offers only a
					handful of independent cycles to count, and it is why the report defers
					this test to the larger study. Source:{" "}
					<code className="font-mono text-[11px]">surrogate_resp_audio.csv</code>.
				</>
			}
		>
			<svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Observed ${metric} against a phase-shuffled null for every subject and block.`}>
				{groups.map((g) => {
					const top = g.top;
					return (
						<g key={g.block}>
							<text x={8} y={top + 11} className="fill-foreground font-sans" style={{ fontSize: 10 }}>
								{BLOCK_LABEL[g.block]}
							</text>
							{g.rows.map((r, i) => {
								const cy = px(top + i * ROW_H + 8);
								const clears = r.obs > r.hi;
								return (
									<g key={r.s}>
										<text x={PAD_L - 10} y={cy + 3} textAnchor="end" className="fill-muted font-sans" style={{ fontSize: 8 }}>
											{r.s}
										</text>
										{/* the null's middle 95% */}
										<rect
											x={x(r.lo)}
											y={cy - 4}
											width={Math.max(1, x(r.hi) - x(r.lo))}
											height={8}
											fill={SERIES_COLOR.null}
											opacity={0.35}
											rx={1}
										/>
										<line x1={x(r.nullMean)} y1={cy - 5} x2={x(r.nullMean)} y2={cy + 5} stroke={SERIES_COLOR.null} strokeWidth={1} />
										{/* what was measured */}
										<circle
											cx={x(r.obs)}
											cy={cy}
											r={3.4}
											fill={clears ? SERIES_COLOR.result : "var(--background)"}
											stroke={clears ? SERIES_COLOR.result : SERIES_COLOR.body}
											strokeWidth={1.5}
										/>
									</g>
								);
							})}
						</g>
					);
				})}
				<text x={PAD_L} y={H - 4} className="fill-muted font-sans" style={{ fontSize: 9 }}>
					{lo.toFixed(2)}
				</text>
				<text x={W - PAD_R} y={H - 4} textAnchor="end" className="fill-muted font-sans" style={{ fontSize: 9 }}>
					{hi.toFixed(2)}
				</text>
			</svg>

			<div className="mt-4 border-t border-rule pt-4">
				<Readout
					items={[
						{ label: "clears the null", value: `${above} of ${total}`, series: above > total * 0.1 ? "result" : undefined, muted: above <= total * 0.1 },
						{ label: "expected by chance", value: `about ${Math.round(total * 0.025)}`, muted: true },
						{ label: "grey bar", value: "middle 95%", muted: true },
					]}
				/>
			</div>
		</Figure>
	);
}
