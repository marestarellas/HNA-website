/**
 * Spectral parameterisation: separating the aperiodic background of a spectrum
 * from the oscillatory peaks sitting on top of it.
 *
 * This is the FOOOF model, implemented small. A power spectrum in log space is
 * treated as a straight background line plus a handful of Gaussian bumps:
 *
 *     log10 P(f) = offset - exponent * log10(f)  +  sum of Gaussians
 *
 * The reason it matters is arithmetic rather than aesthetic. Band power is an
 * integral over a window, and it goes up either when a peak grows or when the
 * background tilts underneath it. Those are different claims about a brain, and
 * a measure that cannot tell them apart will report them identically.
 *
 * Simplified against the real implementation: fixed and knee modes are both
 * here, but peak fitting estimates each Gaussian from its own neighbourhood
 * rather than running a full non-linear optimisation over all peaks at once.
 * On clean spectra the difference is small, and the recovery is checked against
 * known inputs before anything is published.
 */

import { mulberry32, gaussian as randn, mean } from "./_signals";

export type Peak = { cf: number; pw: number; bw: number };

export type Aperiodic = {
	offset: number;
	exponent: number;
	/** Only used in knee mode. */
	knee?: number;
};

/** The background, in log10 power. */
export function aperiodicAt(f: number, ap: Aperiodic): number {
	if (ap.knee !== undefined && ap.knee > 0) {
		return ap.offset - Math.log10(ap.knee + Math.pow(f, ap.exponent));
	}
	return ap.offset - ap.exponent * Math.log10(f);
}

/** One peak's contribution, in log10 power. */
export function peakAt(f: number, p: Peak): number {
	const d = (f - p.cf) / (p.bw || 1);
	return p.pw * Math.exp(-0.5 * d * d);
}

export function freqAxis(lo = 1, hi = 50, step = 0.5): number[] {
	const out: number[] = [];
	for (let f = lo; f <= hi + 1e-9; f += step) out.push(+f.toFixed(4));
	return out;
}

/** Build a spectrum from a model, optionally with measurement noise. */
export function synthSpectrum(
	freqs: number[],
	ap: Aperiodic,
	peaks: Peak[],
	noise = 0,
	seed = 5
): number[] {
	const rand = mulberry32(seed);
	return freqs.map((f) => {
		let v = aperiodicAt(f, ap);
		for (const p of peaks) v += peakAt(f, p);
		if (noise > 0) v += randn(rand) * noise;
		return v;
	});
}

/* --------------------------------------------------------------- fitting */

/** Least-squares line through (log10 f, log10 P), returned as offset/exponent. */
function fitLine(freqs: number[], logP: number[], mask?: boolean[]): Aperiodic {
	const xs: number[] = [];
	const ys: number[] = [];
	for (let i = 0; i < freqs.length; i++) {
		if (mask && !mask[i]) continue;
		xs.push(Math.log10(freqs[i]));
		ys.push(logP[i]);
	}
	const mx = mean(xs);
	const my = mean(ys);
	let num = 0;
	let den = 0;
	for (let i = 0; i < xs.length; i++) {
		num += (xs[i] - mx) * (ys[i] - my);
		den += (xs[i] - mx) * (xs[i] - mx);
	}
	const slope = den === 0 ? 0 : num / den;
	return { offset: my - slope * mx, exponent: -slope };
}

/**
 * Robust initial background fit.
 *
 * A plain regression through a spectrum with peaks in it is dragged upward by
 * those peaks, so the background comes out too shallow. Fitting once, discarding
 * everything sitting well above that first line, and refitting on what is left
 * gives a background that ignores the bumps. FOOOF does the same thing for the
 * same reason.
 */
function robustAperiodic(freqs: number[], logP: number[]): Aperiodic {
	let ap = fitLine(freqs, logP);
	for (let pass = 0; pass < 3; pass++) {
		const resid = logP.map((v, i) => v - aperiodicAt(freqs[i], ap));
		const sorted = [...resid].sort((a, b) => a - b);
		// Keep the lower ~70%: the background is the floor of the spectrum.
		const cut = sorted[Math.floor(sorted.length * 0.7)];
		const mask = resid.map((r) => r <= cut);
		if (mask.filter(Boolean).length < 6) break;
		ap = fitLine(freqs, logP, mask);
	}
	return ap;
}

export type FitResult = {
	aperiodic: Aperiodic;
	peaks: Peak[];
	/** The model's prediction at each frequency, in log10 power. */
	fitted: number[];
	/** Spectrum minus the fitted background: what the peaks live on. */
	flattened: number[];
	rSquared: number;
};

/**
 * Fit background and peaks, in the order FOOOF does it: background first so the
 * peaks have something to stand on, then peaks, then the background again now
 * that the peaks can be taken out of the way.
 */
export function fitSpectrum(
	freqs: number[],
	logP: number[],
	maxPeaks = 4,
	peakThreshold = 0.08
): FitResult {
	let ap = robustAperiodic(freqs, logP);
	const peaks: Peak[] = [];

	// Extract peaks one at a time from the flattened spectrum.
	//
	// A candidate sitting inside the skirt of a peak already found is nearly
	// always a leftover from subtracting that peak, since each Gaussian here is
	// estimated from its own neighbourhood rather than refined against all the
	// others. Such a candidate is removed from the residual without being
	// recorded. FOOOF discards overlapping peaks for the same reason.
	let flat = logP.map((v, i) => v - aperiodicAt(freqs[i], ap));
	for (let k = 0; k < maxPeaks * 3 && peaks.length < maxPeaks; k++) {
		let bi = -1;
		let bv = peakThreshold;
		for (let i = 1; i < flat.length - 1; i++) {
			if (flat[i] > bv) {
				bv = flat[i];
				bi = i;
			}
		}
		if (bi < 0) break;

		// Width from the half-maximum crossings either side of the peak.
		const half = bv / 2;
		let lo = bi;
		while (lo > 0 && flat[lo] > half) lo--;
		let hi = bi;
		while (hi < flat.length - 1 && flat[hi] > half) hi++;
		const fwhm = Math.max(0.5, freqs[hi] - freqs[lo]);
		const p: Peak = { cf: freqs[bi], pw: bv, bw: fwhm / 2.355 };

		// Closer than the two widths put together means the same bump twice.
		const overlaps = peaks.some((q) => Math.abs(q.cf - p.cf) < q.bw + p.bw);
		if (!overlaps) peaks.push(p);

		// Remove it either way, so the next pass looks somewhere new.
		flat = flat.map((v, i) => v - peakAt(freqs[i], p));
	}

	// Refit the background now that the peaks can be subtracted out.
	if (peaks.length) {
		const peakFree = logP.map(
			(v, i) => v - peaks.reduce((s, p) => s + peakAt(freqs[i], p), 0)
		);
		ap = fitLine(freqs, peakFree);
	}

	const fitted = freqs.map(
		(f) => aperiodicAt(f, ap) + peaks.reduce((s, p) => s + peakAt(f, p), 0)
	);
	const flattened = logP.map((v, i) => v - aperiodicAt(freqs[i], ap));

	const my = mean(logP);
	let ssRes = 0;
	let ssTot = 0;
	for (let i = 0; i < logP.length; i++) {
		ssRes += (logP[i] - fitted[i]) ** 2;
		ssTot += (logP[i] - my) ** 2;
	}

	return {
		aperiodic: ap,
		peaks,
		fitted,
		flattened,
		rSquared: ssTot === 0 ? 0 : 1 - ssRes / ssTot,
	};
}

/* ----------------------------------------------------------- band power */

/**
 * Total power in a band, computed the ordinary way: sum the linear power across
 * the window. Deliberately naive, because being naive is the point. This number
 * cannot tell a taller peak from a tilted background, and the page is built
 * around showing that.
 */
export function bandPower(freqs: number[], logP: number[], lo: number, hi: number): number {
	let s = 0;
	for (let i = 0; i < freqs.length; i++) {
		if (freqs[i] < lo || freqs[i] > hi) continue;
		s += Math.pow(10, logP[i]);
	}
	return s;
}

/** The same band, after the background has been removed. */
export function periodicBandPower(
	freqs: number[],
	flattened: number[],
	lo: number,
	hi: number
): number {
	let s = 0;
	for (let i = 0; i < freqs.length; i++) {
		if (freqs[i] < lo || freqs[i] > hi) continue;
		s += Math.max(0, flattened[i]);
	}
	return s;
}
