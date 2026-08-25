"use client";

import { useState } from "react";
import { Figure } from "./_ui";

/**
 * The 3 × 4 grid from the methods report: what you compare (feature) crossed
 * with how you compare it (coupling family). Every coupling analysis in the
 * project lands in exactly one cell, and two cells are worth pointing at
 * because they dissolve names that sound like separate methods.
 */

type Cell = {
	method: string;
	detail: string;
	canonical?: boolean;
	identity?: boolean;
};

const COLUMNS = ["Linear", "Oscillatory", "Information", "Complexity"] as const;
const ROWS = [
	{ key: "raw", label: "Raw signal", sub: "the trace itself" },
	{ key: "osc", label: "Oscillatory feature", sub: "phase, band power" },
	{ key: "cplx", label: "Complexity feature", sub: "DFA α, MSE, aperiodic slope" },
] as const;

const GRID: Record<string, (Cell | null)[]> = {
	raw: [
		{
			method: "Windowed cross-correlation",
			detail:
				"Do the two amplitudes rise and fall together, allowing for a delay? The whole linear family. Slides a window, reports the peak correlation and the lag it occurred at.",
			canonical: true,
		},
		{
			method: "Coherence · PLV · wPLI",
			detail:
				"Are they synchronised in phase within a band? Coherence needs both amplitude and phase to agree; PLV asks only about phase consistency, which is why it survives signals whose loudness wanders.",
			canonical: true,
		},
		{
			method: "MI · Granger · transfer entropy",
			detail:
				"Is there any dependence at all — including the non-linear kind a correlation reports as zero — and does it have a direction? Granger is the linear special case of transfer entropy, which is why they sit in one family.",
			canonical: true,
		},
		null,
	],
	osc: [
		{
			method: "Correlation of band-power traces",
			detail:
				"Extract a band-power time course from each signal, then correlate those. The comparison is linear; what makes it oscillatory is the feature it is applied to.",
		},
		{
			method: "Phase–amplitude coupling",
			detail:
				"PAC — Tort's modulation index, Canolty's mean vector length. Here is the first identity worth naming: PAC is not a separate kind of thing. It is oscillatory coupling between two oscillatory features — the phase of a slow band against the amplitude of a fast one.",
			canonical: true,
			identity: true,
		},
		{
			method: "MI between band-power traces",
			detail:
				"Mutual information on oscillatory features, for when the relationship between two band-power courses is real but not linear.",
		},
		null,
	],
	cplx: [
		{
			method: "Exponent matching · complexity coupling",
			detail:
				"The second identity, and worth being candid about: despite the family name, the comparison step here is a plain Pearson r — or an absolute difference between two scalars. The complexity lives entirely in the feature (DFA α, the fluctuation curve, multiscale entropy), never in the operation. A genuinely scale-aware coupling step, such as detrended cross-correlation analysis, is a different and less common animal.",
			canonical: true,
			identity: true,
		},
		null,
		{
			method: "MI between complexity traces",
			detail:
				"Slide a window, get a scaling exponent per window for each signal, then ask whether those two traces depend on each other non-linearly.",
		},
		null,
	],
};

export function CouplingDesignSpace() {
	const [sel, setSel] = useState<{ row: string; col: number }>({ row: "raw", col: 0 });
	const cell = GRID[sel.row][sel.col];

	return (
		<Figure
			label="The design space · what you compare × how you compare it"
			caption="Filled cells are the canonical, widely used combinations; the two ringed cells are the identities described below. Empty cells are not forbidden, merely rare. Select any cell to read what it asks."
		>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[560px] border-collapse">
					<caption className="sr-only">
						Coupling methods arranged by feature type and coupling family. Select a
						cell to read what that combination asks.
					</caption>
					<thead>
						<tr>
							<th scope="col" className="w-40" />
							{COLUMNS.map((c) => (
								<th
									key={c}
									scope="col"
									className="px-1 pb-2 text-left font-sans text-[10px] font-normal uppercase tracking-[0.14em] text-muted"
								>
									{c}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{ROWS.map((row) => (
							<tr key={row.key}>
								<th scope="row" className="py-1 pr-3 text-left align-middle">
									<span className="block font-sans text-[11px] text-foreground">
										{row.label}
									</span>
									<span className="block font-sans text-[10px] text-muted">{row.sub}</span>
								</th>
								{COLUMNS.map((_, ci) => {
									const c = GRID[row.key][ci];
									const active = sel.row === row.key && sel.col === ci;
									if (!c) {
										return (
											<td key={ci} className="p-1">
												<div className="flex h-14 items-center justify-center rounded-sm border border-dashed border-rule">
													<span aria-hidden className="font-sans text-xs text-muted">
														·
													</span>
													<span className="sr-only">not used</span>
												</div>
											</td>
										);
									}
									return (
										<td key={ci} className="p-1">
											<button
												type="button"
												onClick={() => setSel({ row: row.key, col: ci })}
												aria-pressed={active}
												className={[
													"h-14 w-full rounded-sm border px-2 text-left font-sans text-[10px] leading-tight transition-colors",
													active
														? "border-transparent text-background"
														: c.canonical
															? "border-rule bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.11]"
															: "border-rule text-muted hover:text-foreground",
												].join(" ")}
												style={
													active ? { background: "var(--viz-result)" } : undefined
												}
											>
												{c.identity && (
													<span
														aria-hidden
														className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
														style={{
															background: active ? "var(--background)" : "var(--viz-result)",
														}}
													/>
												)}
												{c.method}
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
				{cell ? (
					<>
						<p className="font-sans text-[11px] uppercase tracking-[0.16em] text-muted">
							{ROWS.find((r) => r.key === sel.row)?.label} × {COLUMNS[sel.col]}
							{cell.identity && " · an identity"}
						</p>
						<p className="mt-2 font-serif text-[15px] leading-relaxed text-foreground/85">
							<span className="text-foreground">{cell.method}.</span> {cell.detail}
						</p>
					</>
				) : null}
			</div>
		</Figure>
	);
}
