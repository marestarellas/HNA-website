"use client";

import { useMemo, useState } from "react";
import { Figure, Legend, Slider, Readout, Baseline, SERIES_COLOR } from "./_ui";
import { coloredNoise, dfa, pearson, toPath } from "./_signals";

const N = 2048;
const W = 720;
const H_SIG = 88;
const PLOT_W = 300;
const PLOT_H = 210;
const ALPHA_MAX = 2;

export function ComplexityMatching() {
	const [betaWorld, setBetaWorld] = useState(1.0);
	const [betaBody, setBetaBody] = useState(1.0);

	const { world, body, dW, dB, r } = useMemo(() => {
		// Different seeds: the two signals share no samples whatsoever. Any
		// agreement between them is agreement of statistics, not of timing.
		const w = coloredNoise(N, betaWorld, 3);
		const b = coloredNoise(N, betaBody, 9001);
		return { world: w, body: b, dW: dfa(w), dB: dfa(b), r: pearson(w, b) };
	}, [betaWorld, betaBody]);

	const match = Math.max(0, 1 - Math.abs(dW.alpha - dB.alpha) / ALPHA_MAX);

	// Shared log-log frame for both fluctuation curves.
	const { pathW, pathB } = useMemo(() => {
		const allF = [...dW.fluctuation, ...dB.fluctuation].map((v) => Math.log10(v || 1e-12));
		const fLo = Math.min(...allF);
		const fHi = Math.max(...allF);
		const sLo = Math.log10(dW.scales[0]);
		const sHi = Math.log10(dW.scales[dW.scales.length - 1]);
		const mk = (scales: number[], fl: number[]) => {
			let d = "";
			for (let i = 0; i < scales.length; i++) {
				const x = ((Math.log10(scales[i]) - sLo) / (sHi - sLo || 1)) * (PLOT_W - 40) + 32;
				const y =
					PLOT_H - 26 - ((Math.log10(fl[i] || 1e-12) - fLo) / (fHi - fLo || 1)) * (PLOT_H - 48);
				d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
			}
			return d;
		};
		return { pathW: mk(dW.scales, dW.fluctuation), pathB: mk(dB.scales, dB.fluctuation) };
	}, [dW, dB]);

	return (
		<Figure
			label="Complexity family · matched scaling"
			controls={
				<>
					<Slider
						label="Environment β"
						value={betaWorld}
						min={0}
						max={2}
						step={0.05}
						onChange={setBetaWorld}
						format={(v) => v.toFixed(2)}
					/>
					<Slider
						label="Body β"
						value={betaBody}
						min={0}
						max={2}
						step={0.05}
						onChange={setBetaBody}
						format={(v) => v.toFixed(2)}
					/>
					<Legend
						items={[
							{ key: "world", label: "Environment" },
							{ key: "body", label: "Body" },
						]}
					/>
				</>
			}
			caption={
				<>
					Set both sliders to the same value. The two traces still look nothing alike
					— they share no samples — and their correlation stays near zero, yet their
					fluctuation curves lie almost on top of each other and the matching score
					goes to 1. That is the whole idea:{" "}
					<em>
						two people walking together do not synchronise step for step, but their
						gait-variability scaling exponents converge
					</em>{" "}
					(Marmelat &amp; Delignières, 2012). Attunement need not mean simultaneity.
				</>
			}
		>
			<svg
				viewBox={`0 0 ${W} ${H_SIG}`}
				className="w-full"
				role="img"
				aria-label={`Environment signal with scaling exponent alpha ${dW.alpha.toFixed(2)}.`}
			>
				<Baseline width={W} y={H_SIG / 2} />
				<path d={toPath(world, W, H_SIG, -3.2, 3.2)} fill="none" stroke={SERIES_COLOR.world} strokeWidth={1.4} />
			</svg>
			<svg
				viewBox={`0 0 ${W} ${H_SIG}`}
				className="w-full"
				role="img"
				aria-label={`Body signal with scaling exponent alpha ${dB.alpha.toFixed(2)}.`}
			>
				<Baseline width={W} y={H_SIG / 2} />
				<path d={toPath(body, W, H_SIG, -3.2, 3.2)} fill="none" stroke={SERIES_COLOR.body} strokeWidth={1.4} />
			</svg>

			<div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
				<svg
					viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
					className="w-full max-w-[300px] shrink-0"
					role="img"
					aria-label={`Log-log fluctuation curves. Environment alpha ${dW.alpha.toFixed(2)}, body alpha ${dB.alpha.toFixed(2)}.`}
				>
					<line x1={32} y1={PLOT_H - 26} x2={PLOT_W - 8} y2={PLOT_H - 26} stroke="currentColor" className="text-rule" strokeWidth={1} />
					<line x1={32} y1={12} x2={32} y2={PLOT_H - 26} stroke="currentColor" className="text-rule" strokeWidth={1} />
					<path d={pathW} fill="none" stroke={SERIES_COLOR.world} strokeWidth={2} />
					<path d={pathB} fill="none" stroke={SERIES_COLOR.body} strokeWidth={2} strokeDasharray="5 3" />
					<text x={PLOT_W / 2} y={PLOT_H - 8} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 10 }}>
						log scale s
					</text>
					<text x={10} y={PLOT_H / 2} textAnchor="middle" transform={`rotate(-90 10 ${PLOT_H / 2})`} className="fill-muted font-sans" style={{ fontSize: 10 }}>
						log F(s)
					</text>
				</svg>

				<div className="flex-1">
					<Readout
						items={[
							{ label: "α environment", value: dW.alpha.toFixed(2), series: "world" },
							{ label: "α body", value: dB.alpha.toFixed(2), series: "body" },
							{ label: "Exponent match", value: match.toFixed(3), series: "result" },
							{ label: "Pearson r", value: r.toFixed(3), muted: true },
						]}
					/>
					<p className="mt-4 font-serif text-[15px] leading-relaxed text-foreground/85">
						The slope of each line <em>is</em> the exponent — 0.5 for white noise,
						1.0 for pink, 1.5 for a random walk. The matching score is simply{" "}
						<code className="text-foreground">1 − |α₁ − α₂| / α_max</code>. Note what
						the comparison step actually is: a difference between two numbers. In this
						method the complexity lives entirely in the <em>feature</em>, not in the
						operation — worth knowing before the family name convinces you otherwise.
						Measures whose <em>coupling step</em> is itself scale-aware do exist —
						detrended cross-correlation analysis and cross-sample entropy — and they
						occupy their own cell in the grid two sections down.
					</p>
				</div>
			</div>
		</Figure>
	);
}
