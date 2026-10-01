"use client";

import { useMemo, useState } from "react";
import { Figure, Readout, SERIES_COLOR } from "@/components/demos/_ui";
import { px } from "@/components/demos/_signals";
import { PHASE, CONDITION_LABEL, type Condition } from "./_pilot";
import { Pills } from "./_parts";

/**
 * Where in the breath each person meets the wave.
 *
 * The cleanest small-sample result in the pilot, because it asks a question
 * that five subjects can actually answer. Not "is the coupling above chance",
 * which needs more data than this, but "when each person does lock, do they
 * all lock at the same point in the cycle". Arrows that agree are a result;
 * arrows that scatter are also a result.
 *
 * The resultant length R is recomputed here from the per-subject phases, and
 * it reproduces the report exactly. The Rayleigh p-values are quoted from the
 * report rather than recomputed, because the approximation used for them is
 * not stated and guessing at it would put a number on the page that disagrees
 * with the paper.
 */

const ORDER: Condition[] = ["VIZ", "AUD", "MULTI"];

/** Reported in the preliminary report. VIZ is described there as intermediate
 *  without a figure for p, so it is left out rather than invented. */
const REPORTED_P: Partial<Record<Condition, string>> = {
	AUD: "0.060",
	MULTI: "0.808",
};

const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RAD = 108;

function pol(angle: number, r: number): [number, number] {
	// Screen y grows downward, so the sine is negated to keep the circle
	// reading anticlockwise from the right, the way a phase diagram should.
	return [px(CX + Math.cos(angle) * r), px(CY - Math.sin(angle) * r)];
}

export function PhaseConvergence() {
	const [cond, setCond] = useState<Condition>("AUD");

	const { rows, groupR, groupAngle, locked } = useMemo(() => {
		const rows = PHASE.filter((r) => r.c === cond);
		const C = rows.reduce((s, r) => s + Math.cos(r.meanPhase), 0) / rows.length;
		const S = rows.reduce((s, r) => s + Math.sin(r.meanPhase), 0) / rows.length;
		return {
			rows,
			groupR: Math.hypot(C, S),
			groupAngle: Math.atan2(S, C),
			locked: rows.filter((r) => r.p < 0.05).length,
		};
	}, [cond]);

	const [gx, gy] = pol(groupAngle, groupR * RAD);

	return (
		<Figure
			label="Does everyone breathe at the same point in the wave?"
			controls={
				<Pills
					label="Condition"
					items={ORDER.map((c) => ({ id: c, label: CONDITION_LABEL[c] }))}
					value={cond}
					onPick={setCond}
				/>
			}
			caption={
				<>
					Each arrow is one subject: its direction is the breathing phase at which
					their coupling to the swell was strongest, and its length is how
					consistently they held it across roughly twenty windows. Coloured arrows
					are subjects whose own phases cluster significantly; grey ones do not. The
					black arrow is the group. Under listening the arrows line up and the group
					resultant is long. Add vision and they scatter, which is the shape you would
					expect if looking at the sea pulls each person&rsquo;s timing in a different
					direction. Source:{" "}
					<code className="font-mono text-[11px]">phase_per_subject.csv</code>.
				</>
			}
		>
			<div className="flex flex-wrap items-center justify-center gap-8">
				<svg
					viewBox={`0 0 ${SIZE} ${SIZE}`}
					width={SIZE}
					height={SIZE}
					role="img"
					aria-label={`Preferred respiratory phases for five subjects under ${CONDITION_LABEL[cond]}, group resultant ${groupR.toFixed(2)}.`}
				>
					{/* dial */}
					<circle cx={CX} cy={CY} r={RAD} fill="none" stroke="currentColor" className="text-rule" />
					<circle cx={CX} cy={CY} r={RAD / 2} fill="none" stroke="currentColor" className="text-rule" strokeDasharray="2 4" opacity={0.6} />
					{[0, 90, 180, 270].map((deg) => {
						const [tx, ty] = pol((deg * Math.PI) / 180, RAD + 14);
						return (
							<text key={deg} x={tx} y={ty + 3} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 9 }}>
								{deg}&deg;
							</text>
						);
					})}

					{/* subjects */}
					{rows.map((r) => {
						const [ex, ey] = pol(r.meanPhase, r.R * RAD);
						const sig = r.p < 0.05;
						return (
							<g key={r.s}>
								<line
									x1={CX}
									y1={CY}
									x2={ex}
									y2={ey}
									stroke={sig ? SERIES_COLOR.body : "currentColor"}
									className={sig ? "" : "text-muted"}
									strokeWidth={sig ? 2 : 1.2}
									opacity={sig ? 0.9 : 0.5}
								/>
								<circle cx={ex} cy={ey} r={3} fill={sig ? SERIES_COLOR.body : "currentColor"} className={sig ? "" : "text-muted"} />
							</g>
						);
					})}

					{/* group resultant */}
					<line x1={CX} y1={CY} x2={gx} y2={gy} stroke="currentColor" className="text-foreground" strokeWidth={3} />
					<circle cx={gx} cy={gy} r={4.5} fill="currentColor" className="text-foreground" />
					<circle cx={CX} cy={CY} r={2.5} fill="currentColor" className="text-foreground" />
				</svg>

				<div className="min-w-[12rem]">
					<Readout
						items={[
							{ label: "group R", value: groupR.toFixed(2), series: "result" },
							{ label: "subjects locked", value: `${locked} of ${rows.length}`, series: "body" },
							{
								label: "Rayleigh p",
								value: REPORTED_P[cond] ?? "not reported",
								muted: true,
							},
						]}
					/>
					<p className="mt-4 font-sans text-[11px] leading-relaxed text-muted">
						R runs from 0, arrows pointing everywhere, to 1, all pointing the same
						way. The p is quoted from the report rather than recomputed here.
					</p>
				</div>
			</div>
		</Figure>
	);
}
