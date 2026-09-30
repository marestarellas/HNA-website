"use client";

import { useMemo, useState } from "react";
import { Figure, Legend, Slider, Readout, Baseline, SERIES_COLOR } from "./_ui";
import { toPath, mulberry32, gaussian, pearson } from "./_signals";
import { freqAxis, synthSpectrum, fitSpectrum } from "./_spectra";

/**
 * The aperiodic exponent, fitted in a sliding window, so it becomes a trace
 * rather than a summary.
 *
 * The point is the same one the attunement page makes about complexity: a
 * single number per recording can only be compared across recordings, whereas a
 * number that moves can be set beside another moving number and asked whether
 * the two go together. Here the exponent is driven by a slow environmental
 * signal, and the recovered trace is correlated against it.
 *
 * Each window is fitted independently, with its own noise, so the recovered
 * trace is genuinely noisy in the way a real one would be.
 */

const F = freqAxis(1, 50, 1);
const N_WIN = 60;
const W = 720;
const H = 90;

export function ExponentOverTime() {
	const [coupling, setCoupling] = useState(0.7);
	const [noise, setNoise] = useState(0.05);

	const { driver, recovered, r } = useMemo(() => {
		const rand = mulberry32(31);
		const driver: number[] = [];
		const recovered: number[] = [];

		for (let w = 0; w < N_WIN; w++) {
			const t = w / N_WIN;
			// A slow environmental swell, plus a little wander.
			const d = Math.sin(2 * Math.PI * 1.5 * t) * 0.5 + Math.sin(2 * Math.PI * 0.5 * t) * 0.3;
			driver.push(d);

			// The exponent follows it, to the degree the coupling control allows.
			const exponent = 1.5 + coupling * d * 0.55 + (1 - coupling) * gaussian(rand) * 0.18;
			const s = synthSpectrum(
				F,
				{ offset: 1.2, exponent },
				[{ cf: 10, pw: 0.45, bw: 1.5 }],
				noise,
				100 + w
			);
			recovered.push(fitSpectrum(F, s).aperiodic.exponent);
		}

		return { driver, recovered, r: pearson(driver, recovered) };
	}, [coupling, noise]);

	const dLo = Math.min(...driver);
	const dHi = Math.max(...driver);
	const rLo = Math.min(...recovered);
	const rHi = Math.max(...recovered);

	return (
		<Figure
			label="The exponent as a trace"
			controls={
				<>
					<Slider
						label="Coupling"
						value={coupling}
						min={0}
						max={1}
						step={0.02}
						onChange={setCoupling}
						format={(v) => v.toFixed(2)}
					/>
					<Slider
						label="Measurement noise"
						value={noise}
						min={0}
						max={0.16}
						step={0.01}
						onChange={setNoise}
						format={(v) => v.toFixed(2)}
					/>
					<Legend
						items={[
							{ key: "world", label: "Environmental signal" },
							{ key: "body", label: "Exponent, fitted per window" },
						]}
					/>
				</>
			}
			caption={
				<>
					Sixty windows, each with its own spectrum fitted from scratch, so the lower
					trace carries the wobble that estimating a slope from a noisy spectrum
					actually produces. Take coupling to zero and the exponent still moves, just
					not with anything. That is the situation every measure on this site is built
					to detect, and the reason a correlation between two traces means nothing
					until it has been compared against a null.
				</>
			}
		>
			<p className="mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
				Something in the environment
			</p>
			<svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="A slow environmental signal.">
				<Baseline width={W} y={H / 2} />
				<path d={toPath(driver, W, H, dLo, dHi)} fill="none" stroke={SERIES_COLOR.world} strokeWidth={2} />
			</svg>

			<p className="mt-4 mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
				The aperiodic exponent, window by window
			</p>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className="w-full"
				role="img"
				aria-label={`The fitted exponent over time, correlating with the environmental signal at r of ${r.toFixed(2)}.`}
			>
				<Baseline width={W} y={H / 2} />
				<path d={toPath(recovered, W, H, rLo, rHi)} fill="none" stroke={SERIES_COLOR.body} strokeWidth={2} />
			</svg>

			<div className="mt-4 border-t border-rule pt-4">
				<Readout
					items={[
						{ label: "Correlation", value: r.toFixed(3), series: "result" },
						{ label: "Coupling set", value: coupling.toFixed(2), muted: true },
						{ label: "Exponent range", value: `${rLo.toFixed(2)} to ${rHi.toFixed(2)}`, muted: true },
						{ label: "Windows", value: String(N_WIN), muted: true },
					]}
				/>
			</div>
		</Figure>
	);
}
