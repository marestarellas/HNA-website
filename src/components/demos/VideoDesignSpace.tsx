"use client";

import { useState } from "react";
import { Figure } from "./_ui";

/**
 * The video framework matrix: spatial scale crossed with feature family.
 *
 * Transcribed from the layout documented in HNA.modalities.video. The payoff
 * for a reader who has already met the coupling grid is that the columns here
 * are the same three families. Choosing how much of a frame one number stands
 * for is a genuinely new decision; choosing what about it to measure is not.
 */

type Kind = "named" | "pattern" | "rare";

type Cell = { method: string; blurb: string; kind: Kind; detail: string };

const COLUMNS = [
	{ key: "raw", name: "Raw", sub: "the values themselves", token: "--fam-linear" },
	{
		key: "osc",
		name: "Oscillatory",
		sub: "rhythm and spatial frequency",
		token: "--fam-oscillatory",
	},
	{
		key: "cplx",
		name: "Complexity",
		sub: "roughness and regularity",
		token: "--fam-complexity",
	},
] as const;

const ROWS = [
	{ key: "whole", label: "Whole image", sub: "one number per frame" },
	{ key: "patch", label: "Per patch", sub: "a coarse grid, one number per tile" },
	{ key: "pixel", label: "Per pixel", sub: "every pixel its own time series" },
] as const;

const GRID: Record<string, Cell[]> = {
	whole: [
		{
			method: "luminance · frame difference · optical flow",
			blurb: "brightness, change, and motion with direction",
			kind: "named",
			detail:
				"The cheapest tier and the most used. Optical flow is the interesting member: as well as a magnitude it yields curl, divergence and the entropy of flow direction, so a scene where everything moves the same way is distinguishable from one where motion is scattered even when the total is identical.",
		},
		{
			method: "spatial FFT · timestack · modal decomposition",
			blurb: "peak wavenumber, anisotropy, wave period, oscillating modes",
			kind: "named",
			detail:
				"Three quite different routes to rhythm. The 2-D spectrum of each frame gives a peak wavenumber and an anisotropy telling you whether crests run horizontally or vertically. A timestack reads one column over time and yields the wave period. Modal decomposition finds the handful of spatial patterns whose brightnesses oscillate.",
		},
		{
			method: "fractal dimension · lacunarity · GLCM · radial slope",
			blurb: "how rough, how gappy, how self-similar",
			kind: "named",
			detail:
				"Box-counting fractal dimension and lacunarity ask how structure repeats across scale. Grey-level co-occurrence gives contrast and homogeneity. The radial slope of the 2-D spectrum is the single number behind the claim that natural scenes are scale-free, and it is the same measurement as the slope figure above.",
		},
	],
	patch: [
		{
			method: "per-patch frame difference",
			blurb: "where in the frame the motion is",
			kind: "pattern",
			detail:
				"The same difference measure, kept per tile instead of averaged away. The result is a low-resolution map of activity, which distinguishes a scene where one corner is breaking from one where the whole surface stirs.",
		},
		{
			method: "(uncommon)",
			blurb: "patch-level spectra are rarely worth the cost",
			kind: "rare",
			detail:
				"A tile has few pixels and few frames' worth of context, so a spectrum computed inside one is noisy. Where people want spatially resolved rhythm they usually go straight to the per-pixel tier and accept the expense.",
		},
		{
			method: "patch entropy grid · GLCM per patch",
			blurb: "a map of local texture",
			kind: "named",
			detail:
				"Complexity measures are happier at this tier than oscillatory ones, because entropy and co-occurrence need only a population of values rather than a long clean time series. The output is a texture map that changes frame to frame.",
		},
	],
	pixel: [
		{
			method: "(nothing to name)",
			blurb: "a raw pixel value is just the video again",
			kind: "rare",
			detail:
				"Nothing has been reduced at this point, so there is no measure here to name. The per-pixel tier only becomes useful once something is computed along each pixel's time axis, which is the two cells to the right.",
		},
		{
			method: "per-pixel FFT · sliding STFT · DMD modes",
			blurb: "a map of what frequency each pixel oscillates at",
			kind: "named",
			detail:
				"Run a spectrum down every pixel's own time series and the output is an image whose value at each point is a frequency. On a coastline that map draws the surf zone by itself, because the water there oscillates faster than the water beyond it. Nobody labelled the surf; the measurement found it.",
		},
		{
			method: "Higuchi fractal dimension · DFA per pixel",
			blurb: "a map of how irregular each pixel's history is",
			kind: "named",
			detail:
				"The most expensive thing in the pipeline, and opt-in for that reason: a complexity estimate iterated over every pixel. The reward is a map of temporal irregularity rather than of brightness or motion.",
		},
	],
};

export function VideoDesignSpace() {
	const [sel, setSel] = useState<{ row: string; col: number }>({ row: "whole", col: 0 });
	const cell = GRID[sel.row][sel.col];
	const col = COLUMNS[sel.col];
	const row = ROWS.find((r) => r.key === sel.row)!;

	return (
		<Figure
			label="The video matrix · spatial scale × feature family"
			caption="Rows are a decision about how much of the frame one number stands for. Columns are the same three feature families the coupling page used, because once a scene has become a trace it stops mattering that it came from a camera. Select any cell."
		>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[580px] border-collapse">
					<caption className="sr-only">
						Video feature extractors arranged by spatial scale and feature family.
					</caption>
					<thead>
						<tr>
							<th scope="col" className="w-36" />
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
													"flex h-full min-h-[80px] w-full flex-col rounded-sm border px-2 py-2 text-left transition-colors",
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
													style={cl.kind === "named" ? { color: `var(${c.token})` } : undefined}
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
					<span style={{ color: `var(${col.token})` }}>{col.name}</span> ·{" "}
					{row.label.toLowerCase()}
				</p>
				<p className="mt-2 font-serif text-[15px] leading-relaxed text-foreground/85">
					<span className="text-foreground">{cell.method}.</span> {cell.detail}
				</p>
			</div>
		</Figure>
	);
}
