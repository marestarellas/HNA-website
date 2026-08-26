"use client";

import { useMemo, useState } from "react";
import { Figure, Legend, Readout, Baseline, SERIES_COLOR } from "./_ui";
import { toPath } from "./_signals";
import { SHOWCASE_SIGNALS, SHOWCASE_FPS, SHOWCASE_DURATION_S } from "./_showcase";

/**
 * Traces the toolbox actually measured from real footage.
 *
 * Everything else on this page either synthesises a scene so the answer is
 * known, or approximates a measure in the browser so it can run live. This
 * figure does neither: these are the pipeline's own outputs, computed offline
 * in Python with proper optical flow and proper complexity estimators, and
 * simply plotted.
 *
 * Grouped by the question each group answers rather than by which function
 * produced it, since a reader has no reason to care about the latter.
 */

type Group = "flow" | "scales" | "texture" | "complexity";

const GROUPS: {
	id: Group;
	label: string;
	traces: { key: string; label: string; series: "world" | "body" | "result" }[];
	note: React.ReactNode;
}[] = [
	{
		id: "flow",
		label: "Optical flow",
		traces: [
			{ key: "flow_mag_mean", label: "Magnitude · how much motion", series: "world" },
			{ key: "flow_curl_abs_mean", label: "Curl · how much rotation", series: "body" },
			{ key: "flow_dir_entropy", label: "Direction entropy · how scattered", series: "result" },
		],
		note: (
			<>
				Dense optical flow gives every pixel a motion vector, and those vectors can be
				summarised in more than one way. Magnitude says how much movement there is.
				Curl says how much of it is rotational rather than bulk translation, which on
				water means turbulence and breaking. Direction entropy is the subtle one: it
				is high when the motion is scattered every which way and low when the whole
				frame moves as one, so two clips with identical average speed can be told
				apart by whether they agree about which way they are going.
			</>
		),
	},
	{
		id: "scales",
		label: "Motion across time scales",
		traces: [
			{ key: "flow_dt1_full_mag_mean", label: "Frame to frame", series: "world" },
			{ key: "flow_dt3_full_mag_mean", label: "Across three frames", series: "body" },
			{ key: "flow_dt9_full_mag_mean", label: "Across nine frames", series: "result" },
		],
		note: (
			<>
				The same flow computation run over different gaps in time. A short gap sees
				ripple and spray; a long gap sees the swell moving underneath all of it and
				is largely blind to the fast surface detail. This is the temporal counterpart
				of choosing a spatial scale, and it matters for the same reason: the gap you
				choose decides which motion you are able to measure.
			</>
		),
	},
	{
		id: "texture",
		label: "Spatial texture",
		traces: [
			{ key: "edge_density", label: "Edge density", series: "world" },
			{ key: "fractal_dim", label: "Fractal dimension", series: "body" },
			{ key: "spatial_psd_slope", label: "Spectral slope", series: "result" },
		],
		note: (
			<>
				Complexity measures on each frame in isolation, with no reference to time at
				all. Edge density and fractal dimension both climb when foam breaks up the
				surface. The spectral slope is the same quantity the synthesised figure above
				was built around, measured here on real water: it drifts as the scene moves
				between smooth swell and broken foam, which is a compact way of saying the
				texture changed.
			</>
		),
	},
	{
		id: "complexity",
		label: "Complexity over time",
		traces: [
			{ key: "wc_flow_mag_mean__higuchi_fd", label: "Higuchi fractal dimension", series: "world" },
			{ key: "wc_flow_mag_mean__perm_entropy", label: "Permutation entropy", series: "body" },
			{ key: "wc_luminance__spectral_entropy", label: "Spectral entropy of luminance", series: "result" },
		],
		note: (
			<>
				Complexity computed inside a sliding window rather than once for the whole
				clip, which is what turns it from a summary into a signal. Only in this form
				can it be set beside a brain or heart measure and asked whether the two vary
				together. It is the same promotion described on the attunement page, applied
				to a scene instead of a trace.
			</>
		),
	},
];

const W = 720;
const H = 74;

export function RealSignals() {
	const [group, setGroup] = useState<Group>("flow");
	const active = GROUPS.find((g) => g.id === group)!;

	const rows = useMemo(
		() =>
			active.traces.map((t) => {
				const data = SHOWCASE_SIGNALS[t.key] ?? [];
				const lo = data.length ? Math.min(...data) : 0;
				const hi = data.length ? Math.max(...data) : 1;
				return { ...t, data, lo, hi };
			}),
		[active]
	);

	return (
		<Figure
			label="Optical flow, texture and complexity"
			controls={
				<>
					<div className="flex flex-wrap gap-2">
						{GROUPS.map((g) => (
							<button
								key={g.id}
								type="button"
								onClick={() => setGroup(g.id)}
								aria-pressed={group === g.id}
								className={[
									"rounded-full border px-3 py-1 font-sans text-[11px] transition-colors",
									group === g.id
										? "border-foreground bg-foreground text-background"
										: "border-rule text-muted hover:text-foreground",
								].join(" ")}
							>
								{g.label}
							</button>
						))}
					</div>
					<Legend items={rows.map((r) => ({ key: r.series, label: r.label }))} />
				</>
			}
			caption={active.note}
		>
			<div className="space-y-3">
				{rows.map((r) => (
					<div key={r.key}>
						<div className="flex items-baseline justify-between">
							<p className="font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
								{r.label}
							</p>
							<p className="font-sans text-[10px] tabular-nums text-muted">
								{r.lo.toFixed(3)} to {r.hi.toFixed(3)}
							</p>
						</div>
						<svg
							viewBox={`0 0 ${W} ${H}`}
							className="w-full"
							role="img"
							aria-label={`${r.label} over the clip.`}
						>
							<Baseline width={W} y={H - 2} />
							<path
								d={toPath(r.data, W, H, r.lo, r.hi)}
								fill="none"
								stroke={SERIES_COLOR[r.series]}
								strokeWidth={1.8}
							/>
						</svg>
					</div>
				))}
			</div>

			<div className="mt-4 flex justify-between font-sans text-[10px] text-muted">
				<span>0 s</span>
				<span>
					{SHOWCASE_FPS} fps
				</span>
				<span>{SHOWCASE_DURATION_S} s</span>
			</div>

			<div className="mt-4 border-t border-rule pt-4">
				<Readout
					items={[
						{ label: "Traces shown", value: String(rows.length), muted: true },
						{ label: "Frames each", value: String(rows[0]?.data.length ?? 0), muted: true },
						{ label: "Frame rate", value: `${SHOWCASE_FPS} fps`, muted: true },
					]}
				/>
			</div>
		</Figure>
	);
}
