"use client";

import { useMemo, useState } from "react";
import { Figure, Legend, Slider, Baseline, SERIES_COLOR } from "./_ui";
import { hilbert, mulberry32, gaussian, toPath, zscore } from "./_signals";

const N = 1024;
const FS = 256;
const W = 720;
const H = 150;

/** Moving average — the pipeline band-limits the envelope after the Hilbert
 *  step; this is the cheap equivalent of that smoothing. */
function smooth(x: number[], win: number): number[] {
	const out = new Array<number>(x.length);
	let acc = 0;
	const half = Math.floor(win / 2);
	for (let i = 0; i < x.length; i++) {
		acc = 0;
		let n = 0;
		for (let j = Math.max(0, i - half); j <= Math.min(x.length - 1, i + half); j++) {
			acc += x[j];
			n++;
		}
		out[i] = acc / n;
	}
	return out;
}

export function EnvelopeExtraction() {
	const [swellRate, setSwellRate] = useState(0.7);

	const { raw, env } = useMemo(() => {
		const rand = mulberry32(7);
		// A broadband "sound" — noise, as a wave-break roughly is — whose loudness
		// swells and fades at `swellRate` Hz.
		const carrier: number[] = [];
		for (let i = 0; i < N; i++) carrier.push(gaussian(rand));

		const signal = new Array<number>(N);
		for (let i = 0; i < N; i++) {
			const t = i / FS;
			const modulator = 1 + 0.85 * Math.sin(2 * Math.PI * swellRate * t - Math.PI / 2);
			signal[i] = carrier[i] * modulator;
		}

		const { envelope } = hilbert(signal);
		return { raw: zscore(signal), env: smooth(envelope, 61) };
	}, [swellRate]);

	// Plot both against the raw signal's range so the envelope visibly rides on
	// top of the waveform rather than being rescaled to fill the box.
	const lo = Math.min(...raw);
	const hi = Math.max(...raw);
	const envScaled = useMemo(() => {
		const eMax = Math.max(...env) || 1;
		return env.map((v) => (v / eMax) * hi);
	}, [env, hi]);

	return (
		<Figure
			label="Signal → feature · Hilbert envelope"
			controls={
				<>
					<Slider
						label="Swell rate"
						value={swellRate}
						min={0.2}
						max={4}
						step={0.05}
						onChange={setSwellRate}
						format={(v) => `${v.toFixed(2)} Hz`}
					/>
					<Legend
						items={[
							{ key: "world", label: "Raw signal — the fast carrier" },
							{ key: "result", label: "Amplitude envelope — the slow shape riding on it" },
						]}
					/>
				</>
			}
			caption={
				<>
					The envelope is recovered with a Hilbert transform, which treats the signal
					as a rotating vector and reads off its length. Nothing here is specific to
					sound: the same operation applied to a movement trace, a light level or a
					physiological rhythm returns the same kind of object — a slow record of how
					much is happening. Every method further down this page takes one of these as
					input.
				</>
			}
		>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className="w-full"
				role="img"
				aria-label={`A noisy waveform whose loudness rises and falls ${swellRate.toFixed(2)} times per second, with its amplitude envelope traced over it.`}
			>
				<Baseline width={W} y={H / 2} />
				<path
					d={toPath(raw, W, H, lo, hi)}
					fill="none"
					stroke={SERIES_COLOR.world}
					strokeWidth={1}
					opacity={0.55}
				/>
				<path
					d={toPath(envScaled, W, H, lo, hi)}
					fill="none"
					stroke={SERIES_COLOR.result}
					strokeWidth={2}
				/>
				<path
					d={toPath(
						envScaled.map((v) => -v),
						W,
						H,
						lo,
						hi
					)}
					fill="none"
					stroke={SERIES_COLOR.result}
					strokeWidth={2}
					opacity={0.4}
				/>
			</svg>
		</Figure>
	);
}
