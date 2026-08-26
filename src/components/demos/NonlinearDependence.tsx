"use client";

import { useMemo, useState } from "react";
import { Figure, Readout, SERIES_COLOR } from "./_ui";
import { mulberry32, gaussian, pearson, mutualInformation, zscore, px } from "./_signals";

const N = 600;
const SIZE = 260;

type Shape = "linear" | "quadratic" | "ring" | "independent";

const SHAPES: { id: Shape; label: string; blurb: string }[] = [
	{
		id: "linear",
		label: "Linear",
		blurb:
			"The easy case. Both estimators agree there is something here, and a correlation is the more interpretable of the two because it also carries a sign.",
	},
	{
		id: "quadratic",
		label: "Quadratic",
		blurb:
			"Knowing x tells you a great deal about y, but the relationship folds back on itself, so the positive and negative halves cancel and Pearson r collapses to nearly zero. Mutual information does not care about direction or shape; it only asks whether knowing one reduces uncertainty about the other.",
	},
	{
		id: "ring",
		label: "Ring",
		blurb:
			"A pure dependence with no linear component at all. Every point lies on a circle of known radius, yet r is ≈ 0. This is the shape that most cleanly separates the two questions.",
	},
	{
		id: "independent",
		label: "Independent",
		blurb:
			"No relationship at all. Note that MI does not read exactly zero, a histogram estimator on finite data always reports a little dependence that is not there. That floor is precisely why a raw MI value means nothing on its own, and why the next section exists.",
	},
];

export function NonlinearDependence() {
	const [shape, setShape] = useState<Shape>("quadratic");

	const { pts, r, mi } = useMemo(() => {
		const rand = mulberry32(101);
		const xs: number[] = [];
		const ys: number[] = [];
		for (let i = 0; i < N; i++) {
			let x: number;
			let y: number;
			switch (shape) {
				case "linear":
					x = gaussian(rand);
					y = x * 0.9 + gaussian(rand) * 0.45;
					break;
				case "quadratic":
					x = gaussian(rand);
					y = x * x + gaussian(rand) * 0.35;
					break;
				case "ring": {
					const a = rand() * 2 * Math.PI;
					const rr = 1 + gaussian(rand) * 0.09;
					x = Math.cos(a) * rr;
					y = Math.sin(a) * rr;
					break;
				}
				default:
					x = gaussian(rand);
					y = gaussian(rand);
			}
			xs.push(x);
			ys.push(y);
		}
		const zx = zscore(xs);
		const zy = zscore(ys);
		return {
			pts: zx.map((v, i) => [v, zy[i]] as const),
			r: pearson(zx, zy),
			mi: mutualInformation(zx, zy, 10),
		};
	}, [shape]);

	const active = SHAPES.find((s) => s.id === shape)!;
	const toXY = (v: number) => px(((v + 3) / 6) * SIZE);

	return (
		<Figure
			label="Information family · dependence without correlation"
			controls={
				<div className="flex flex-wrap gap-2">
					{SHAPES.map((s) => (
						<button
							key={s.id}
							type="button"
							onClick={() => setShape(s.id)}
							aria-pressed={shape === s.id}
							className={[
								"rounded-full border px-3 py-1 font-sans text-[11px] transition-colors",
								shape === s.id
									? "border-foreground bg-foreground text-background"
									: "border-rule text-muted hover:text-foreground",
							].join(" ")}
						>
							{s.label}
						</button>
					))}
				</div>
			}
			caption={
				<>
					Research implementations generally reach for a k-nearest-neighbour estimator,
					and a bias-corrected <em>effective</em> MI, rather than the histogram used
					here, but the question is identical: is there <em>any</em> dependence, of
					any shape? Granger causality and transfer entropy belong to this same family
					because they ask that question with a direction attached.
				</>
			}
		>
			<div className="flex flex-col gap-6 sm:flex-row sm:items-start">
				<svg
					viewBox={`0 0 ${SIZE} ${SIZE}`}
					className="w-full max-w-[260px] shrink-0"
					role="img"
					aria-label={`Scatter plot of the ${active.label.toLowerCase()} relationship. Correlation ${r.toFixed(2)}, mutual information ${mi.toFixed(2)} bits.`}
				>
					<rect x={0} y={0} width={SIZE} height={SIZE} fill="none" stroke="currentColor" className="text-rule" strokeWidth={1} />
					<line x1={SIZE / 2} y1={0} x2={SIZE / 2} y2={SIZE} stroke="currentColor" className="text-rule" strokeWidth={1} strokeDasharray="2 4" />
					<line x1={0} y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} stroke="currentColor" className="text-rule" strokeWidth={1} strokeDasharray="2 4" />
					{pts.map(([x, y], i) => (
						<circle key={i} cx={toXY(x)} cy={px(SIZE - toXY(y))} r={1.6} fill={SERIES_COLOR.result} opacity={0.5} />
					))}
				</svg>

				<div className="flex-1">
					<Readout
						items={[
							{ label: "Pearson r", value: r.toFixed(3), muted: true },
							{ label: "Mutual information", value: `${mi.toFixed(2)} bits`, series: "result" },
						]}
					/>
					<p className="mt-4 font-serif text-[15px] leading-relaxed text-foreground/85">
						{active.blurb}
					</p>
				</div>
			</div>
		</Figure>
	);
}
