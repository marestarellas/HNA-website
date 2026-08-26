"use client";

import { useState } from "react";
import { Figure } from "./_ui";

/**
 * The framework matrix from the methods report: what you compare (feature)
 * crossed with how you compare it (coupling family). Every coupling analysis
 * lands in exactly one cell.
 *
 * Transcribed from the report's own figure rather than reconstructed, because
 * the empty-looking cells are the informative ones and it is easy to get them
 * wrong. Three states, and the distinction matters:
 *
 *   named:   a canonical, named method
 *   pattern: a general approach with no special name; perfectly usable
 *   rare:    uncommon or not standard, and the reason why is the lesson
 *
 * No cell is truly empty. "(rare)" is a statement about practice, not about
 * possibility, and collapsing that into a blank would teach that the
 * combination is impossible.
 */

type Kind = "named" | "pattern" | "rare";

type Cell = {
	method: string;
	blurb: string;
	kind: Kind;
	/** Longer note shown in the detail panel below the grid. */
	detail: string;
};

const COLUMNS = [
	{ key: "linear", name: "Linear", sub: "Pearson, cross-correlation", token: "--fam-linear" },
	{
		key: "oscillatory",
		name: "Oscillatory",
		sub: "phase / spectrum / phase-amplitude",
		token: "--fam-oscillatory",
	},
	{
		key: "information",
		name: "Information",
		sub: "MI, effective MI, Granger, TE, PID, Φ-ID",
		token: "--fam-information",
	},
	{
		key: "complexity",
		name: "Complexity",
		sub: "DCCA, cross-sample entropy, multiscale",
		token: "--fam-complexity",
	},
] as const;

const ROWS = [
	{ key: "raw", label: "Raw signal", sub: "x[t] itself" },
	{ key: "osc", label: "Oscillatory features", sub: "envelope, phase, band-power" },
	{
		key: "cplx",
		label: "Complexity features",
		sub: "fractality + entropy: DFA, FD, FOOOF, MSE",
	},
] as const;

const GRID: Record<string, Cell[]> = {
	raw: [
		{
			method: "cross-correlation",
			blurb: "lag-search Pearson on raw samples",
			kind: "named",
			detail:
				"Slide one signal past the other and take the peak. The simplest coupling there is, and the one worth trying before anything else: if it answers your question, nothing further is needed.",
		},
		{
			method: "(feature step needed)",
			blurb: "PLV / wPLI / coherence imply Hilbert / Welch first",
			kind: "rare",
			detail:
				"Not a gap so much as a mislabel. You cannot do oscillatory coupling on a raw trace without first extracting phase or spectrum: a Hilbert transform, or a Welch periodogram. The moment you do, you are working on an oscillatory feature, which is the row below. Methods that appear to act on raw signal are quietly taking that step for you.",
		},
		{
			method: "MI, effective MI, Granger, TE, PID, Φ-ID",
			blurb: "global / directional / synergistic information",
			kind: "named",
			detail:
				"The information family applies directly to raw samples. Mutual information asks whether any dependence exists; Granger and transfer entropy add a direction; partial information decomposition and Φ-ID go further again, splitting what several sources carry into redundant, unique and synergistic parts.",
		},
		{
			method: "DCCA, DCCA-ρ, cross-sample entropy, multiscale variant",
			blurb: "scale-resolved bivariate fluctuation / regularity",
			kind: "named",
			detail:
				"Genuinely scale-aware bivariate methods. The coupling step itself is non-linear and resolved across scales, rather than a linear comparison of two separately-computed features. Detrended cross-correlation analysis gives a joint scaling exponent; DCCA-ρ is the per-scale analogue of Pearson r; cross-sample entropy measures the regularity of the joint dynamics.",
		},
	],
	osc: [
		{
			method: "xcorr / corr",
			blurb: "of envelopes or band-power",
			kind: "pattern",
			detail:
				"Extract an envelope or a band-power trace from each signal, then correlate those. The comparison is linear; what makes it oscillatory is the feature it is applied to. No special name, and none needed.",
		},
		{
			method: "PLV / wPLI / coherence; PAC (Tort, Canolty)",
			blurb: "same-band phase or slow phase × fast amp",
			kind: "named",
			detail:
				"The heart of the oscillatory family. Phase-locking value and the debiased weighted phase-lag index ask whether the phase relationship is stable; coherence additionally demands amplitude agreement. Phase-amplitude coupling is the cross-frequency case, the phase of a slow rhythm against the amplitude of a fast one, and is oscillatory coupling between two oscillatory features rather than a separate kind of thing.",
		},
		{
			method: "MI of envelopes / band-power traces",
			blurb: "non-linear envelope coupling",
			kind: "pattern",
			detail:
				"Mutual information applied to oscillatory features, for when the relationship between two band-power courses is real but not linear.",
		},
		{
			method: "(uncommon)",
			blurb: "DCCA on envelopes; rarely standard",
			kind: "rare",
			detail:
				"Perfectly possible: an envelope is a time series like any other, and DCCA will happily consume two of them. It simply is not established practice, so there is little literature to compare against.",
		},
	],
	cplx: [
		{
			method: "exponent matching · fluctuation matching · MSE matching · complexity coupling",
			blurb: "scalar / scale curves / time trace; all = Pearson on the feature",
			kind: "named",
			detail:
				"Worth being precise about: despite the family name, the comparison step here is a plain Pearson r, or an absolute difference between two scalars. The complexity lives entirely in the feature (DFA α, the fluctuation curve, multiscale entropy), not in the operation. That is not a criticism; it is what the methods are. The genuinely scale-aware bivariate methods live in the Complexity column, top-right.",
		},
		{
			method: "(rare)",
			blurb: "phase-locking on a complexity trace is not standard",
			kind: "rare",
			detail:
				"A windowed scaling exponent is a slow time series, and you could in principle ask whether two of them are phase-locked. Almost nobody does: a complexity trace rarely has a rhythm stable enough for phase to be meaningful.",
		},
		{
			method: "MI between complexity traces",
			blurb: "non-linear coupling of scaling / entropy",
			kind: "pattern",
			detail:
				"Slide a window, get a scaling exponent per window for each signal, then ask whether those two traces depend on each other in any way, including non-linearly.",
		},
		{
			method: "(compose)",
			blurb: "DCCA on complexity traces; exotic",
			kind: "rare",
			detail:
				"Reachable by composition: run a scale-aware bivariate method over two complexity traces. Defensible, and very hard to interpret: you are asking about the scaling structure of a scaling structure.",
		},
	],
};

const KIND_LEGEND: { kind: Kind; label: string }[] = [
	{ kind: "named", label: "Named method" },
	{ kind: "pattern", label: "General approach" },
	{ kind: "rare", label: "Uncommon / not standard" },
];

export function CouplingDesignSpace() {
	const [sel, setSel] = useState<{ row: string; col: number }>({ row: "raw", col: 0 });
	const cell = GRID[sel.row][sel.col];
	const col = COLUMNS[sel.col];
	const row = ROWS.find((r) => r.key === sel.row)!;

	return (
		<Figure
			label="The framework matrix · what you compare × how you compare it"
			controls={
				<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
					{KIND_LEGEND.map((k) => (
						<span key={k.kind} className="flex items-center gap-2">
							<span
								aria-hidden
								className={[
									"block h-3 w-3 rounded-[2px] border",
									k.kind === "named"
										? "border-foreground/70 bg-foreground/15"
										: k.kind === "pattern"
											? "border-rule"
											: "border-dashed border-rule",
								].join(" ")}
							/>
							<span className="font-sans text-[11px] text-muted">{k.label}</span>
						</span>
					))}
				</div>
			}
			caption="Adapted from the methods report. No cell is empty: the faded ones say a combination is uncommon or needs an extra step, which is a statement about practice rather than possibility. Select any cell to read what it asks."
		>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[680px] border-collapse">
					<caption className="sr-only">
						Coupling methods arranged by feature type and coupling family. Select a cell
						to read what that combination asks.
					</caption>
					<thead>
						<tr>
							<th scope="col" className="w-40" />
							{COLUMNS.map((c) => (
								<th key={c.key} scope="col" className="p-1 align-bottom">
									<div
										className="rounded-sm px-2 py-1.5 text-left"
										style={{ background: `var(${c.token})` }}
									>
										<span className="block font-sans text-[12px] font-medium text-white">
											{c.name}
										</span>
										<span className="mt-0.5 block font-sans text-[9px] leading-tight text-white/80">
											{c.sub}
										</span>
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{ROWS.map((r) => (
							<tr key={r.key}>
								<th scope="row" className="p-1 text-left align-top">
									<div className="rounded-sm bg-foreground/[0.06] px-2 py-2">
										<span className="block font-sans text-[11px] text-foreground">
											{r.label}
										</span>
										<span className="mt-0.5 block font-sans text-[9px] leading-tight text-muted">
											{r.sub}
										</span>
									</div>
								</th>
								{COLUMNS.map((c, ci) => {
									const cl = GRID[r.key][ci];
									const active = sel.row === r.key && sel.col === ci;
									return (
										<td key={c.key} className="p-1 align-top">
											<button
												type="button"
												onClick={() => setSel({ row: r.key, col: ci })}
												aria-pressed={active}
												className={[
													"flex h-full min-h-[86px] w-full flex-col rounded-sm border px-2 py-2 text-left transition-colors",
													cl.kind === "rare"
														? "border-dashed border-rule hover:border-solid"
														: cl.kind === "named"
															? "bg-foreground/[0.05]"
															: "border-rule",
												].join(" ")}
												style={
													cl.kind === "named"
														? {
																borderColor: `var(${c.token})`,
																outline: active ? `2px solid var(${c.token})` : undefined,
																outlineOffset: active ? "1px" : undefined,
															}
														: active
															? { outline: `2px solid var(${c.token})`, outlineOffset: "1px" }
															: undefined
												}
											>
												<span
													className={[
														"font-sans text-[10px] leading-tight",
														cl.kind === "rare" ? "text-muted" : "font-medium",
													].join(" ")}
													style={
														cl.kind === "named" ? { color: `var(${c.token})` } : undefined
													}
												>
													{cl.method}
												</span>
												<span className="mt-1 font-sans text-[9px] leading-tight text-muted">
													{cl.blurb}
												</span>
											</button>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div aria-live="polite" className="mt-4 border-t border-rule pt-4">
				<p className="font-sans text-[11px] uppercase tracking-[0.16em] text-muted">
					<span style={{ color: `var(${col.token})` }}>{col.name}</span> coupling ·{" "}
					{row.label.toLowerCase()}
				</p>
				<p className="mt-2 font-serif text-[15px] leading-relaxed text-foreground/85">
					<span className="text-foreground">{cell.method}.</span> {cell.detail}
				</p>
			</div>
		</Figure>
	);
}
