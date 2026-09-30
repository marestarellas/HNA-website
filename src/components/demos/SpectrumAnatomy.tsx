"use client";

import { useMemo, useState } from "react";
import { Figure, Legend, Slider, Readout, SERIES_COLOR } from "./_ui";
import { px } from "./_signals";
import {
	freqAxis,
	synthSpectrum,
	fitSpectrum,
	aperiodicAt,
	type Peak,
} from "./_spectra";

/**
 * Build a spectrum, then watch the fit take it apart again.
 *
 * The reader sets a background slope and an alpha peak; the figure fits the
 * result as if it had never seen the recipe, and reports what it recovered.
 * Setting a value and getting it back is the only way to make a claim about a
 * method believable, and it makes the model itself legible: a straight line in
 * log-log, plus bumps.
 */

const F = freqAxis(1, 50, 0.5);
const W = 720;
const H = 230;
const H_FLAT = 120;

const X0 = 38;
const Y0 = 16;

function xOf(f: number): number {
	const lo = Math.log10(F[0]);
	const hi = Math.log10(F[F.length - 1]);
	return px(X0 + ((Math.log10(f) - lo) / (hi - lo)) * (W - X0 - 10));
}

function makeY(lo: number, hi: number, top: number, bottom: number) {
	return (v: number) => px(bottom - ((v - lo) / (hi - lo || 1)) * (bottom - top));
}

function path(freqs: number[], vals: number[], y: (v: number) => number): string {
	let d = "";
	for (let i = 0; i < freqs.length; i++) {
		d += `${i === 0 ? "M" : "L"}${xOf(freqs[i])} ${y(vals[i])}`;
	}
	return d;
}

export function SpectrumAnatomy() {
	const [exponent, setExponent] = useState(1.5);
	const [peakPw, setPeakPw] = useState(0.6);
	const [peakCf, setPeakCf] = useState(10);
	const [noise, setNoise] = useState(0.03);

	const { spectrum, fit, truthPeak } = useMemo(() => {
		const truthPeak: Peak = { cf: peakCf, pw: peakPw, bw: 1.5 };
		const s = synthSpectrum(
			F,
			{ offset: 1.2, exponent },
			peakPw > 0.02 ? [truthPeak] : [],
			noise,
			11
		);
		return { spectrum: s, fit: fitSpectrum(F, s), truthPeak };
	}, [exponent, peakPw, peakCf, noise]);

	const lo = Math.min(...spectrum) - 0.15;
	const hi = Math.max(...spectrum) + 0.15;
	const y = makeY(lo, hi, Y0, H - 26);

	const flatLo = Math.min(-0.1, Math.min(...fit.flattened));
	const flatHi = Math.max(0.3, Math.max(...fit.flattened));
	const yFlat = makeY(flatLo, flatHi, 10, H_FLAT - 24);

	const background = F.map((f) => aperiodicAt(f, fit.aperiodic));
	const found = fit.peaks.length ? fit.peaks.reduce((a, b) => (b.pw > a.pw ? b : a)) : null;

	const ticks = [1, 2, 5, 10, 20, 50];

	return (
		<Figure
			label="Anatomy of a spectrum · a line, plus bumps"
			controls={
				<>
					<Slider
						label="Background slope"
						value={exponent}
						min={0.4}
						max={2.6}
						step={0.05}
						onChange={setExponent}
						format={(v) => v.toFixed(2)}
					/>
					<Slider
						label="Peak height"
						value={peakPw}
						min={0}
						max={1.2}
						step={0.02}
						onChange={setPeakPw}
						format={(v) => v.toFixed(2)}
					/>
					<Slider
						label="Peak centre"
						value={peakCf}
						min={4}
						max={30}
						step={0.5}
						onChange={setPeakCf}
						format={(v) => `${v.toFixed(1)} Hz`}
					/>
					<Slider
						label="Noise"
						value={noise}
						min={0}
						max={0.16}
						step={0.01}
						onChange={setNoise}
						format={(v) => v.toFixed(2)}
					/>
					<Legend
						items={[
							{ key: "world", label: "The spectrum" },
							{ key: "body", label: "Fitted background", dashed: true },
							{ key: "result", label: "What is left over" },
						]}
					/>
				</>
			}
			caption={
				<>
					Both axes are logarithmic, which is what turns the background into a straight
					line rather than a curve. Take the peak height to zero and the spectrum{" "}
					<em>is</em> the line: no rhythm at all, just the aperiodic background that
					every recording has. Watch the lower panel while you do it. With any noise
					present the peak finder still reports small bumps that were never put there,
					and more of them as the noise rises, because a peak finder given a bumpy
					floor will find bumps. The fit never sees the settings above; it works only
					from the curve.
				</>
			}
		>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className="w-full"
				role="img"
				aria-label={`A power spectrum on log axes with a fitted background of exponent ${fit.aperiodic.exponent.toFixed(2)}.`}
			>
				<line x1={X0} y1={H - 26} x2={W - 10} y2={H - 26} stroke="currentColor" className="text-rule" strokeWidth={1} />
				<line x1={X0} y1={Y0} x2={X0} y2={H - 26} stroke="currentColor" className="text-rule" strokeWidth={1} />
				{ticks.map((t) => (
					<g key={t}>
						<line x1={xOf(t)} y1={H - 26} x2={xOf(t)} y2={H - 22} stroke="currentColor" className="text-rule" strokeWidth={1} />
						<text x={xOf(t)} y={H - 12} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 9 }}>
							{t}
						</text>
					</g>
				))}
				<text x={X0 - 6} y={Y0 + 6} textAnchor="end" className="fill-muted font-sans" style={{ fontSize: 9 }}>
					log power
				</text>
				<text x={W - 10} y={H - 12} textAnchor="end" className="fill-muted font-sans" style={{ fontSize: 9 }}>
					Hz
				</text>

				<path d={path(F, spectrum, y)} fill="none" stroke={SERIES_COLOR.world} strokeWidth={1.8} />
				<path
					d={path(F, background, y)}
					fill="none"
					stroke={SERIES_COLOR.body}
					strokeWidth={2}
					strokeDasharray="5 4"
				/>
			</svg>

			<p className="mt-3 mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
				The spectrum with the background subtracted
			</p>
			<svg
				viewBox={`0 0 ${W} ${H_FLAT}`}
				className="w-full"
				role="img"
				aria-label="The same spectrum after the background has been removed, leaving the peaks."
			>
				<line x1={X0} y1={yFlat(0)} x2={W - 10} y2={yFlat(0)} stroke="currentColor" className="text-rule" strokeWidth={1} />
				<path d={path(F, fit.flattened, yFlat)} fill="none" stroke={SERIES_COLOR.result} strokeWidth={1.8} />
				{fit.peaks.map((p, i) => (
					<line
						key={i}
						x1={xOf(p.cf)}
						y1={yFlat(0)}
						x2={xOf(p.cf)}
						y2={yFlat(p.pw)}
						stroke={SERIES_COLOR.result}
						strokeWidth={1}
						strokeDasharray="2 2"
						opacity={0.6}
					/>
				))}
				{ticks.map((t) => (
					<text key={t} x={xOf(t)} y={H_FLAT - 8} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 9 }}>
						{t}
					</text>
				))}
			</svg>

			<div className="mt-4 border-t border-rule pt-4">
				<Readout
					items={[
						{ label: "Slope set", value: exponent.toFixed(2), muted: true },
						{ label: "Slope recovered", value: fit.aperiodic.exponent.toFixed(2), series: "body" },
						{
							label: "Peak set",
							value: peakPw > 0.02 ? `${truthPeak.cf.toFixed(1)} Hz / ${peakPw.toFixed(2)}` : "none",
							muted: true,
						},
						{
							label: "Peak found",
							value: found ? `${found.cf.toFixed(1)} Hz / ${found.pw.toFixed(2)}` : "none",
							series: "result",
						},
						{ label: "Peaks found", value: String(fit.peaks.length), muted: true },
						{ label: "Fit quality", value: fit.rSquared.toFixed(3), muted: true },
					]}
				/>
			</div>
		</Figure>
	);
}
