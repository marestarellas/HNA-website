/**
 * Synthetic sound, EEG and ECG, plus the observable each one reduces to.
 *
 * Kept out of the component that draws them, and free of JSX, so a test harness
 * can import it directly and check the maths against known answers — which is
 * the only way to be sure the ECG's heart-rate trace really carries the
 * breathing rhythm the caption claims it does, rather than merely looking as
 * though it might.
 */

import { hilbert, bandpass, coloredNoise, mulberry32, gaussian, zscore } from "./_signals";

export const FS = 256;
export const N = 2048; // 8 seconds

export type Observable = {
	raw: number[];
	/** The slow trace every downstream method actually operates on. */
	observable: number[];
	/** Drawn faintly over the raw trace to show the derivation. */
	overlay?: number[];
	/** Sample indices of detected beats (ECG only). */
	marks?: number[];
};

/**
 * Moving average. Real pipelines band-limit an envelope after extracting it;
 * this is the cheap equivalent.
 *
 * Mind the window length. A moving average of duration T is a sinc filter with
 * its first null at 1/T, so it does not merely soften an envelope — it can
 * erase a modulation faster than that outright. An earlier version smoothed the
 * sound envelope over 81 samples (0.32 s at 256 Hz, first null ~3.2 Hz) while
 * offering a swell-rate slider that went to 4 Hz, so the top of the slider's
 * range quietly measured nothing. Keep 1/T comfortably above the fastest
 * modulation the control can ask for.
 */
export function smooth(x: number[], win: number): number[] {
	const out = new Array<number>(x.length);
	const half = Math.floor(win / 2);
	for (let i = 0; i < x.length; i++) {
		let acc = 0;
		let n = 0;
		for (let j = Math.max(0, i - half); j <= Math.min(x.length - 1, i + half); j++) {
			acc += x[j];
			n++;
		}
		out[i] = acc / n;
	}
	return out;
}

/**
 * Broadband noise whose loudness swells at `rate` Hz. The envelope comes
 * straight off a Hilbert transform — the simple case.
 */
export function buildSound(rate: number): Observable {
	const rand = mulberry32(7);
	const carrier: number[] = [];
	for (let i = 0; i < N; i++) carrier.push(gaussian(rand));

	const sig = new Array<number>(N);
	for (let i = 0; i < N; i++) {
		const t = i / FS;
		sig[i] = carrier[i] * (1 + 0.85 * Math.sin(2 * Math.PI * rate * t - Math.PI / 2));
	}

	const { envelope } = hilbert(sig);
	// 31 samples ≈ 0.12 s, first null ≈ 8.3 Hz — comfortably above the 4 Hz top
	// of the swell-rate control, so the whole slider range stays meaningful.
	const env = smooth(envelope, 31);
	return { raw: zscore(sig), observable: env, overlay: env };
}

/**
 * A 1/f background with a 10 Hz alpha rhythm on top, bursting at `burst` Hz.
 *
 * The band-pass is not optional here: the overall amplitude of an EEG says
 * little, because several rhythms and the aperiodic background are summed into
 * it. Isolating the band first is what makes the envelope answer a question.
 */
export function buildEeg(burst: number): Observable {
	const bg = coloredNoise(N, 1.6, 21);
	const sig = new Array<number>(N);
	for (let i = 0; i < N; i++) {
		const t = i / FS;
		const spindle = Math.max(0, Math.sin(2 * Math.PI * burst * t - Math.PI / 2));
		sig[i] = bg[i] * 0.75 + Math.sin(2 * Math.PI * 10 * t) * spindle * 1.9;
	}

	const alpha = bandpass(sig, FS, 8, 12);
	const { envelope } = hilbert(alpha);
	// 61 samples ≈ 0.24 s, first null ≈ 4.2 Hz, well clear of the 1.5 Hz top of
	// the burst-rate control.
	const env = smooth(envelope, 61);
	return { raw: zscore(sig), observable: env, overlay: env };
}

/**
 * Beats whose spacing is modulated by breathing — respiratory sinus arrhythmia,
 * a real effect. The point of the panel is that this rhythm lives entirely in
 * the *timing*: it is invisible in the trace's amplitude and obvious the moment
 * you plot instantaneous rate.
 */
export function buildEcg(resp: number): Observable & { meanBpm: number } {
	const rr0 = 0.85; // ~70 bpm
	const beats: number[] = [];
	const rates: number[] = [];
	let t = 0.35;
	while (t < N / FS) {
		const rr = rr0 * (1 + 0.14 * Math.sin(2 * Math.PI * resp * t));
		beats.push(t);
		rates.push(60 / rr);
		t += rr;
	}

	const sig = new Array<number>(N).fill(0);
	const bump = (centre: number, amp: number, width: number) => {
		const c = centre * FS;
		const w = width * FS;
		const from = Math.max(0, Math.floor(c - 4 * w));
		const to = Math.min(N - 1, Math.ceil(c + 4 * w));
		for (let i = from; i <= to; i++) {
			const d = (i - c) / w;
			sig[i] += amp * Math.exp(-0.5 * d * d);
		}
	};
	for (const b of beats) {
		bump(b - 0.16, 0.09, 0.028); //   P
		bump(b - 0.022, -0.16, 0.008); // Q
		bump(b, 1.0, 0.007); //           R
		bump(b + 0.026, -0.28, 0.009); // S
		bump(b + 0.18, 0.22, 0.038); //   T
	}

	// Instantaneous rate, interpolated between beats.
	const rate = new Array<number>(N).fill(rates[0] ?? 70);
	for (let k = 0; k < beats.length - 1; k++) {
		const i0 = Math.max(0, Math.round(beats[k] * FS));
		const i1 = Math.min(N, Math.round(beats[k + 1] * FS));
		for (let i = i0; i < i1; i++) {
			const f = (i - i0) / Math.max(1, i1 - i0);
			rate[i] = rates[k] + (rates[k + 1] - rates[k]) * f;
		}
	}
	const lastIdx = Math.round(beats[beats.length - 1] * FS);
	for (let i = Math.max(0, lastIdx); i < N; i++) rate[i] = rates[rates.length - 1];

	return {
		raw: zscore(sig),
		observable: rate,
		marks: beats.map((b) => Math.round(b * FS)),
		meanBpm: rates.reduce((s, v) => s + v, 0) / rates.length,
	};
}
