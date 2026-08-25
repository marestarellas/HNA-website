/**
 * Synthetic sound, EEG and ECG, and the three kinds of time series any of them
 * can be reduced to.
 *
 * Two independent choices are being modelled here, and keeping them separate is
 * the point:
 *
 *   1. WHICH SIGNAL — sound, EEG, ECG. Each arrives in a different form and
 *      needs a different first move to become a one-dimensional trace at all.
 *      A sound is already one; an EEG is too; an ECG is not, because its
 *      information is in beat *timing*, so it reduces to instantaneous rate.
 *
 *   2. WHICH FEATURE — and this is the axis that is easy to miss. Having got a
 *      trace, you still choose what about it to compare: the trace itself, the
 *      power in one band as it rises and falls, or how its scaling structure
 *      changes over time. These are the three feature rows of the design-space
 *      grid, and every one of them is a legitimate input to every coupling
 *      method further down the page.
 *
 * Free of JSX so a harness can import and check it.
 */

import {
	hilbert,
	bandpass,
	coloredNoise,
	mulberry32,
	gaussian,
	zscore,
	windowedExponent,
} from "./_signals";

export const FS = 256;
export const N = 2048; // 8 seconds

export type Kind = "sound" | "eeg" | "ecg";
export type Feature = "raw" | "band" | "complexity";

export type Recording = {
	/** What the instrument records. */
	raw: number[];
	/**
	 * The one-dimensional trace everything downstream operates on. For sound and
	 * EEG this is the recording itself; for ECG it is instantaneous rate,
	 * because the waveform is not the object of study.
	 */
	base: number[];
	/** Beat positions, for drawing on the ECG trace. */
	marks?: number[];
};

/** Moving average. Real pipelines band-limit an envelope after extracting it;
 *  this is the cheap equivalent.
 *
 *  Mind the window length. A moving average of duration T is a sinc filter with
 *  its first null at 1/T, so it does not merely soften an envelope — it can
 *  erase a modulation faster than that outright. An earlier version smoothed a
 *  sound envelope over 0.32 s while offering a swell-rate control that went to
 *  4 Hz, so the top of that control quietly measured nothing. Keep 1/T
 *  comfortably above the fastest modulation the control can ask for. */
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

/* ------------------------------------------------------------- recordings */

/** Broadband noise whose loudness swells at `rate` Hz. */
export function recordSound(rate: number): Recording {
	const rand = mulberry32(7);
	const carrier: number[] = [];
	for (let i = 0; i < N; i++) carrier.push(gaussian(rand));

	const sig = new Array<number>(N);
	for (let i = 0; i < N; i++) {
		const t = i / FS;
		sig[i] = carrier[i] * (1 + 0.85 * Math.sin(2 * Math.PI * rate * t - Math.PI / 2));
	}
	const z = zscore(sig);
	return { raw: z, base: z };
}

/** A 1/f background with a 10 Hz alpha rhythm bursting at `burst` Hz. */
export function recordEeg(burst: number): Recording {
	const bg = coloredNoise(N, 1.6, 21);
	const sig = new Array<number>(N);
	for (let i = 0; i < N; i++) {
		const t = i / FS;
		const spindle = Math.max(0, Math.sin(2 * Math.PI * burst * t - Math.PI / 2));
		sig[i] = bg[i] * 0.75 + Math.sin(2 * Math.PI * 10 * t) * spindle * 1.9;
	}
	const z = zscore(sig);
	return { raw: z, base: z };
}

/**
 * Beats whose spacing is modulated by breathing — respiratory sinus arrhythmia.
 * The rhythm lives entirely in the timing: invisible in the trace's amplitude,
 * obvious the moment you plot instantaneous rate.
 */
export function recordEcg(resp: number): Recording & { meanBpm: number } {
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
		base: rate,
		marks: beats.map((b) => Math.round(b * FS)),
		meanBpm: rates.reduce((s, v) => s + v, 0) / rates.length,
	};
}

export function record(kind: Kind, control: number): Recording {
	if (kind === "eeg") return recordEeg(control);
	if (kind === "ecg") return recordEcg(control);
	return recordSound(control);
}

/* ---------------------------------------------------------------- features */

/** The band each signal's oscillatory feature is taken from, and why. */
export const BAND: Record<Kind, { lo: number; hi: number; name: string }> = {
	// Broad, because a wave-break has no carrier frequency worth naming — the
	// power in almost any slice of it rises and falls with the swell.
	sound: { lo: 20, hi: 60, name: "20–60 Hz" },
	// Alpha. The rhythm that actually bursts in the trace above.
	eeg: { lo: 8, hi: 12, name: "8–12 Hz alpha" },
	// The high-frequency HRV band — this is literally where respiratory sinus
	// arrhythmia is measured in the clinical literature.
	ecg: { lo: 0.15, hi: 0.45, name: "0.15–0.45 Hz (HF / respiratory)" },
};

/**
 * Derive one of the three comparable time series from a recording's base trace.
 *
 * All three come out the same shape — one value per sample — which is exactly
 * why any of them can be fed to any coupling method. That interchangeability is
 * the lesson.
 */
export function feature(rec: Recording, kind: Kind, which: Feature): number[] {
	if (which === "raw") return rec.base;

	if (which === "band") {
		const { lo, hi } = BAND[kind];
		const filtered = bandpass(rec.base, FS, lo, hi);
		const { envelope } = hilbert(filtered);
		// Smoothing window chosen per band: fast enough to follow the modulation
		// the control imposes, slow enough to suppress the envelope's ripple.
		return smooth(envelope, kind === "ecg" ? 129 : 31);
	}

	// Complexity as a trace: scaling exponent in a sliding window.
	return windowedExponent(rec.base, 512, 32).trace;
}
