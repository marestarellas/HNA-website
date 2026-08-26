"use client";

import { useMemo, useState } from "react";
import { Figure, Slider, Readout, SERIES_COLOR } from "./_ui";
import { coloredNoise, mutualInformation, phaseShuffle, zscore, px } from "./_signals";

const N = 2048;
const N_SURROGATES = 150;
const MI_BINS = 8;
const BINS = 22; // histogram display bins

// Seeds are fixed rather than random, and this pair was checked rather than
// picked blind. Sweeping twelve seed pairs at zero coupling, eleven land inside
// their null and one lands outside, which is not a bug, it is the 5% of the
// time a surrogate test reports a false positive by construction. An earlier
// default happened to be that one draw, and a demo whose opening state
// contradicts its own caption teaches the wrong lesson. This pair shows the
// typical case.
const W = 520;
const H = 200;

export function SurrogateTest() {
	const [coupling, setCoupling] = useState(0);

	const { observed, nullMIs, hist, pctile, z } = useMemo(() => {
		const a = coloredNoise(N, 1.2, 21);
		const indep = coloredNoise(N, 1.2, 404);
		// Mix a shared component into b. At coupling 0 the two are independent,
		// but both are smooth, which is exactly the condition that inflates MI.
		const b = zscore(a.map((v, i) => coupling * v + (1 - coupling) * indep[i]));

		const obs = mutualInformation(a, b, MI_BINS);

		const nulls: number[] = [];
		for (let s = 0; s < N_SURROGATES; s++) {
			// Shuffle the phases of b: same power spectrum, same autocorrelation,
			// no relationship to a.
			nulls.push(mutualInformation(a, phaseShuffle(b, 1000 + s), MI_BINS));
		}

		const lo = Math.min(...nulls, obs);
		const hi = Math.max(...nulls, obs);
		const range = hi - lo || 1;
		const counts = new Array<number>(BINS).fill(0);
		for (const v of nulls) {
			counts[Math.min(BINS - 1, Math.floor(((v - lo) / range) * BINS))]++;
		}

		const below = nulls.filter((v) => v < obs).length;
		const m = nulls.reduce((s, v) => s + v, 0) / nulls.length;
		const sd =
			Math.sqrt(nulls.reduce((s, v) => s + (v - m) * (v - m), 0) / nulls.length) || 1e-9;

		return {
			observed: obs,
			nullMIs: nulls,
			hist: { counts, lo, hi },
			pctile: (below / nulls.length) * 100,
			z: (obs - m) / sd,
		};
	}, [coupling]);

	const maxCount = Math.max(...hist.counts, 1);
	const barW = px((W - 40) / BINS);
	const xOf = (v: number) => px(32 + ((v - hist.lo) / (hist.hi - hist.lo || 1)) * (W - 40));
	const significant = pctile >= 95;

	return (
		<Figure
			label="Is it real? · phase-shuffled surrogates"
			controls={
				<Slider
					label="True coupling"
					value={coupling}
					min={0}
					max={0.6}
					step={0.02}
					onChange={setCoupling}
					format={(v) => v.toFixed(2)}
				/>
			}
			caption={
				<>
					Phase shuffling keeps a signal&rsquo;s power spectrum, and therefore its
					autocorrelation and its smoothness, while destroying any relationship it had
					to the other signal. Whatever the estimator reports on those is what the
					shape of the signal manufactures for free. Some measures fold this in
					directly, subtracting the surrogate mean so the number returned is already
					dependence <em>above the spectral floor</em>. The same logic scales up: run
					the test on many pairs at once and you need to correct for having given
					yourself many chances to be fooled.
				</>
			}
		>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className="w-full"
				role="img"
				aria-label={`Histogram of mutual information from ${N_SURROGATES} phase-shuffled surrogates, with the observed value at the ${pctile.toFixed(0)}th percentile.`}
			>
				<line x1={32} y1={H - 30} x2={W - 8} y2={H - 30} stroke="currentColor" className="text-rule" strokeWidth={1} />
				{hist.counts.map((c, i) => {
					const h = px((c / maxCount) * (H - 60));
					return (
						<rect
							key={i}
							x={px(32 + i * barW + 1)}
							y={px(H - 30 - h)}
							width={px(Math.max(1, barW - 2))}
							height={h}
							fill={SERIES_COLOR.null}
							rx={1}
						/>
					);
				})}

				{/* Observed value: direct-labelled, never colour alone. */}
				<line
					x1={xOf(observed)}
					y1={14}
					x2={xOf(observed)}
					y2={H - 30}
					stroke={SERIES_COLOR.result}
					strokeWidth={2}
				/>
				<circle cx={xOf(observed)} cy={14} r={4} fill={SERIES_COLOR.result} />
				<text
					x={px(Math.min(W - 60, xOf(observed) + 8))}
					y={12}
					className="fill-foreground font-sans"
					style={{ fontSize: 10 }}
				>
					observed
				</text>
				<text x={32} y={H - 12} className="fill-muted font-sans" style={{ fontSize: 10 }}>
					mutual information (bits) →
				</text>
				<text x={W - 8} y={H - 12} textAnchor="end" className="fill-muted font-sans" style={{ fontSize: 10 }}>
					{N_SURROGATES} surrogates
				</text>
			</svg>

			<div className="mt-4">
				<Readout
					items={[
						{ label: "Observed MI", value: `${observed.toFixed(3)} bits`, series: "result" },
						{
							label: "Surrogate mean",
							value: `${(nullMIs.reduce((s, v) => s + v, 0) / nullMIs.length).toFixed(3)} bits`,
							muted: true,
						},
						{ label: "Percentile", value: `${pctile.toFixed(0)}th`, muted: true },
						{ label: "z", value: z.toFixed(1), muted: true },
					]}
				/>
				<p className="mt-4 font-serif text-[15px] leading-relaxed text-foreground/85">
					{significant ? (
						<>
							The observed value now sits outside the null. Whatever MI the spectrum
							alone could manufacture, this pair exceeds it, the coupling is doing
							real work.
						</>
					) : (
						<>
							Start at zero coupling. The observed MI is plainly greater than zero,
							and it means nothing. Two smooth, autocorrelated signals produce
							apparent dependence for free. The surrogate distribution shows exactly
							how much a signal of this spectrum manufactures on its own, and the
							observed value sits comfortably inside it. Raise the coupling until the
							marker leaves the histogram.
						</>
					)}
				</p>
			</div>
		</Figure>
	);
}
