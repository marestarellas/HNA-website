/**
 * Signal-processing primitives for the Learn demos.
 *
 * These are real implementations, not stand-ins: the Hilbert envelope really
 * is computed through an FFT, the mutual information really is estimated from
 * a joint histogram, the scaling exponent really comes from detrended
 * fluctuation analysis. A demo that faked its numbers would teach the shape of
 * an idea while quietly lying about it, which is worse than no demo.
 *
 * They are simplified against `HNA` in ways that are stated at each function:
 * mostly the estimator choice (histogram MI rather than the k-NN estimator,
 * no bias correction) rather than the concept.
 *
 * Everything is deterministic — `mulberry32` seeds every random draw — so the
 * server and client render identical signals and a reader can be told "move
 * the slider back and you get the same picture".
 */

/* ------------------------------------------------------------------ random */

/** Small, fast, seedable PRNG. Deterministic output matters here: React
 *  hydration compares server and client markup, and `Math.random()` would
 *  make them disagree. */
export function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Box–Muller: uniform → standard normal. */
export function gaussian(rand: () => number): number {
	let u = 0;
	while (u === 0) u = rand();
	const v = rand();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* --------------------------------------------------------------------- fft */

function nextPow2(n: number): number {
	let p = 1;
	while (p < n) p <<= 1;
	return p;
}

/**
 * In-place iterative radix-2 Cooley–Tukey FFT. `re`/`im` must be power-of-two
 * length. Used by the Hilbert transform and by the spectral noise synthesis
 * below.
 */
export function fft(re: Float64Array, im: Float64Array, inverse = false): void {
	const n = re.length;

	// Bit-reversal permutation.
	for (let i = 1, j = 0; i < n; i++) {
		let bit = n >> 1;
		for (; j & bit; bit >>= 1) j ^= bit;
		j ^= bit;
		if (i < j) {
			const tr = re[i]; re[i] = re[j]; re[j] = tr;
			const ti = im[i]; im[i] = im[j]; im[j] = ti;
		}
	}

	for (let len = 2; len <= n; len <<= 1) {
		const ang = ((inverse ? 2 : -2) * Math.PI) / len;
		const wr = Math.cos(ang);
		const wi = Math.sin(ang);
		const half = len >> 1;
		for (let i = 0; i < n; i += len) {
			let cr = 1;
			let ci = 0;
			for (let k = 0; k < half; k++) {
				const ur = re[i + k];
				const ui = im[i + k];
				const xr = re[i + k + half];
				const xi = im[i + k + half];
				const vr = xr * cr - xi * ci;
				const vi = xr * ci + xi * cr;
				re[i + k] = ur + vr;
				im[i + k] = ui + vi;
				re[i + k + half] = ur - vr;
				im[i + k + half] = ui - vi;
				const ncr = cr * wr - ci * wi;
				ci = cr * wi + ci * wr;
				cr = ncr;
			}
		}
	}

	if (inverse) {
		for (let i = 0; i < n; i++) {
			re[i] /= n;
			im[i] /= n;
		}
	}
}

/**
 * Analytic signal via the Hilbert transform: zero the negative frequencies,
 * double the positive ones, invert. Returns instantaneous amplitude
 * (the envelope) and instantaneous phase.
 *
 * This is the operation behind `HNA.modalities.audio.decompose_envelope` and
 * the reason the pipeline analyses envelopes at all — the brain tracks how a
 * sound's loudness swells and fades, not its raw pressure waveform.
 */
export function hilbert(x: number[]): { envelope: number[]; phase: number[] } {
	const n = x.length;
	const N = nextPow2(n);
	const re = new Float64Array(N);
	const im = new Float64Array(N);
	for (let i = 0; i < n; i++) re[i] = x[i];

	fft(re, im);

	// h: 1 at DC and Nyquist, 2 on positive frequencies, 0 on negative.
	const half = N >> 1;
	for (let i = 1; i < half; i++) {
		re[i] *= 2;
		im[i] *= 2;
	}
	for (let i = half + 1; i < N; i++) {
		re[i] = 0;
		im[i] = 0;
	}

	fft(re, im, true);

	const envelope = new Array<number>(n);
	const phase = new Array<number>(n);
	for (let i = 0; i < n; i++) {
		envelope[i] = Math.hypot(re[i], im[i]);
		phase[i] = Math.atan2(im[i], re[i]);
	}
	return { envelope, phase };
}

/**
 * Zero-phase band-pass by masking the spectrum: forward FFT, null every bin
 * outside [lo, hi], invert. Crude next to a Butterworth section — the brick-wall
 * edge rings a little — but it introduces no phase shift at all, which matters
 * here: these demos show an envelope sitting on top of the wave that produced
 * it, and a filter that slid the signal sideways would quietly teach a lie.
 *
 * Both halves of each conjugate pair are zeroed together so the inverse stays
 * real.
 */
export function bandpass(x: number[], fs: number, lo: number, hi: number): number[] {
	const n = x.length;
	const N = nextPow2(n);
	const re = new Float64Array(N);
	const im = new Float64Array(N);
	for (let i = 0; i < n; i++) re[i] = x[i];

	fft(re, im);

	const df = fs / N;
	const half = N >> 1;
	for (let k = 0; k <= half; k++) {
		const f = k * df;
		if (f < lo || f > hi) {
			re[k] = 0;
			im[k] = 0;
			if (k > 0 && k < half) {
				re[N - k] = 0;
				im[N - k] = 0;
			}
		}
	}

	fft(re, im, true);

	const out = new Array<number>(n);
	for (let i = 0; i < n; i++) out[i] = re[i];
	return out;
}

/* ---------------------------------------------------------------- synthesis */

/**
 * Noise with a 1/f^beta power spectrum, made by shaping white noise in the
 * frequency domain. beta = 0 is white, 1 is pink, 2 is Brownian.
 *
 * The demos use this to *set* a scaling exponent so the DFA below can be shown
 * recovering it — the honest way to demonstrate an estimator is to hand it
 * data whose answer you already know.
 */
export function coloredNoise(n: number, beta: number, seed: number): number[] {
	const N = nextPow2(n);
	const rand = mulberry32(seed);
	const re = new Float64Array(N);
	const im = new Float64Array(N);
	for (let i = 0; i < N; i++) re[i] = gaussian(rand);

	fft(re, im);

	const half = N >> 1;
	for (let k = 1; k <= half; k++) {
		const scale = Math.pow(k, -beta / 2);
		re[k] *= scale;
		im[k] *= scale;
		if (k < half) {
			re[N - k] *= scale;
			im[N - k] *= scale;
		}
	}
	re[0] = 0;
	im[0] = 0;

	fft(re, im, true);

	const out = new Array<number>(n);
	for (let i = 0; i < n; i++) out[i] = re[i];
	return zscore(out);
}

/* -------------------------------------------------------------- statistics */

export function mean(x: number[]): number {
	let s = 0;
	for (const v of x) s += v;
	return s / x.length;
}

export function zscore(x: number[]): number[] {
	const m = mean(x);
	let ss = 0;
	for (const v of x) ss += (v - m) * (v - m);
	const sd = Math.sqrt(ss / x.length) || 1;
	return x.map((v) => (v - m) / sd);
}

/** Pearson correlation. The comparison step of the linear family, and — as
 *  `HNA.coupling.complexity` is careful to admit — of the complexity family too. */
export function pearson(a: number[], b: number[]): number {
	const n = Math.min(a.length, b.length);
	const ma = mean(a.slice(0, n));
	const mb = mean(b.slice(0, n));
	let num = 0;
	let da = 0;
	let db = 0;
	for (let i = 0; i < n; i++) {
		const x = a[i] - ma;
		const y = b[i] - mb;
		num += x * y;
		da += x * x;
		db += y * y;
	}
	const den = Math.sqrt(da * db);
	return den === 0 ? 0 : num / den;
}

/**
 * Normalized cross-correlation across a range of integer lags.
 * Positive lag means `b` follows `a`.
 *
 * This is the whole linear family in one function — `HNA.coupling.linear`
 * adds a sliding window on top and reports the peak and its lag per window.
 */
export function crossCorrelation(
	a: number[],
	b: number[],
	maxLag: number
): { lags: number[]; r: number[]; peakLag: number; peakR: number } {
	const za = zscore(a);
	const zb = zscore(b);
	const lags: number[] = [];
	const r: number[] = [];
	let peakLag = 0;
	let peakR = 0;

	for (let lag = -maxLag; lag <= maxLag; lag++) {
		let sum = 0;
		let count = 0;
		for (let i = 0; i < za.length; i++) {
			const j = i + lag;
			if (j < 0 || j >= zb.length) continue;
			sum += za[i] * zb[j];
			count++;
		}
		const v = count > 0 ? sum / count : 0;
		lags.push(lag);
		r.push(v);
		if (Math.abs(v) > Math.abs(peakR)) {
			peakR = v;
			peakLag = lag;
		}
	}
	return { lags, r, peakLag, peakR };
}

/**
 * Mutual information from a joint histogram, in bits.
 *
 * `HNA.coupling.information` uses a k-NN (Kraskov-style) estimator and offers a
 * surrogate-corrected "effective MI"; this is the simpler textbook version.
 * Both answer the same question — is there ANY dependence, including the
 * non-linear kind a correlation coefficient reports as zero?
 */
export function mutualInformation(a: number[], b: number[], bins = 12): number {
	const n = Math.min(a.length, b.length);
	const aMin = Math.min(...a);
	const aMax = Math.max(...a);
	const bMin = Math.min(...b);
	const bMax = Math.max(...b);
	const aRange = aMax - aMin || 1;
	const bRange = bMax - bMin || 1;

	const joint = new Float64Array(bins * bins);
	const pa = new Float64Array(bins);
	const pb = new Float64Array(bins);

	for (let i = 0; i < n; i++) {
		const ia = Math.min(bins - 1, Math.floor(((a[i] - aMin) / aRange) * bins));
		const ib = Math.min(bins - 1, Math.floor(((b[i] - bMin) / bRange) * bins));
		joint[ia * bins + ib] += 1;
		pa[ia] += 1;
		pb[ib] += 1;
	}

	let mi = 0;
	for (let i = 0; i < bins; i++) {
		for (let j = 0; j < bins; j++) {
			const pij = joint[i * bins + j] / n;
			if (pij <= 0) continue;
			const pi = pa[i] / n;
			const pj = pb[j] / n;
			mi += pij * Math.log2(pij / (pi * pj));
		}
	}
	return Math.max(0, mi);
}

/**
 * Phase-locking value: the consistency of the phase difference between two
 * signals. 1 means the lag between them never changes; 0 means it wanders.
 *
 * The key property, and why the oscillatory family exists separately from the
 * linear one: PLV ignores amplitude entirely. Two signals can be perfectly
 * phase-locked while their correlation is zero — a quarter-cycle offset does
 * exactly that.
 */
export function plv(phaseA: number[], phaseB: number[]): number {
	const n = Math.min(phaseA.length, phaseB.length);
	if (n === 0) return 0;
	let sr = 0;
	let si = 0;
	for (let i = 0; i < n; i++) {
		const d = phaseA[i] - phaseB[i];
		sr += Math.cos(d);
		si += Math.sin(d);
	}
	return Math.hypot(sr, si) / n;
}

/**
 * Detrended fluctuation analysis.
 *
 * Integrate the mean-removed signal, cut it into windows of length s, remove a
 * linear trend inside each, and take the RMS of what is left. Plotting that
 * F(s) against s on log axes gives a straight line whose slope is the scaling
 * exponent alpha: 0.5 for white noise, 1.0 for pink/1-f noise, 1.5 for a random
 * walk. Returns the curve as well as the exponent, because the complexity
 * family compares both — `exponent_matching` on the scalar, `fluctuation_matching`
 * on the whole curve.
 */
export function dfa(
	x: number[],
	scales?: number[]
): { scales: number[]; fluctuation: number[]; alpha: number } {
	const n = x.length;
	const m = mean(x);
	const y = new Array<number>(n);
	let acc = 0;
	for (let i = 0; i < n; i++) {
		acc += x[i] - m;
		y[i] = acc;
	}

	const useScales =
		scales ??
		(() => {
			const out: number[] = [];
			for (let s = 8; s <= Math.floor(n / 4); s = Math.round(s * 1.35)) out.push(s);
			return out;
		})();

	const fluctuation: number[] = [];
	const keptScales: number[] = [];

	for (const s of useScales) {
		const nWin = Math.floor(n / s);
		if (nWin < 2) continue;
		let ssTotal = 0;
		for (let w = 0; w < nWin; w++) {
			const start = w * s;
			// Least-squares line over the window, then RMS of the residual.
			let sx = 0;
			let sy = 0;
			let sxx = 0;
			let sxy = 0;
			for (let i = 0; i < s; i++) {
				const xi = i;
				const yi = y[start + i];
				sx += xi;
				sy += yi;
				sxx += xi * xi;
				sxy += xi * yi;
			}
			const denom = s * sxx - sx * sx || 1;
			const slope = (s * sxy - sx * sy) / denom;
			const intercept = (sy - slope * sx) / s;
			let ss = 0;
			for (let i = 0; i < s; i++) {
				const resid = y[start + i] - (slope * i + intercept);
				ss += resid * resid;
			}
			ssTotal += ss / s;
		}
		keptScales.push(s);
		fluctuation.push(Math.sqrt(ssTotal / nWin));
	}

	// alpha = slope of log F(s) vs log s.
	const lx = keptScales.map((s) => Math.log10(s));
	const ly = fluctuation.map((f) => Math.log10(f || 1e-12));
	const mlx = mean(lx);
	const mly = mean(ly);
	let num = 0;
	let den = 0;
	for (let i = 0; i < lx.length; i++) {
		num += (lx[i] - mlx) * (ly[i] - mly);
		den += (lx[i] - mlx) * (lx[i] - mlx);
	}
	const alpha = den === 0 ? 0 : num / den;

	return { scales: keptScales, fluctuation, alpha };
}

/**
 * Scaling exponent computed in a sliding window, giving complexity as a *time
 * series* rather than a single number for the whole recording.
 *
 * This is what makes complexity a feature you can couple on. One alpha per
 * recording can only be compared across recordings; an alpha that moves over
 * time can be correlated against another moving trace, which is the whole basis
 * of the complexity family.
 *
 * Returned at full length — the value for each window is held across the
 * samples it covers — so it plots against the same time axis as the signal it
 * came from.
 */
export function windowedExponent(
	x: number[],
	win = 512,
	step = 32
): { trace: number[]; centres: number[]; values: number[] } {
	const values: number[] = [];
	const centres: number[] = [];

	for (let start = 0; start + win <= x.length; start += step) {
		const seg = x.slice(start, start + win);
		values.push(dfa(seg).alpha);
		centres.push(start + win / 2);
	}

	// Linear interpolation back onto the full time base.
	const trace = new Array<number>(x.length);
	if (values.length === 0) return { trace: trace.fill(0), centres, values };
	for (let i = 0; i < x.length; i++) {
		if (i <= centres[0]) {
			trace[i] = values[0];
		} else if (i >= centres[centres.length - 1]) {
			trace[i] = values[values.length - 1];
		} else {
			let k = 0;
			while (k < centres.length - 1 && centres[k + 1] < i) k++;
			const f = (i - centres[k]) / (centres[k + 1] - centres[k]);
			trace[i] = values[k] + (values[k + 1] - values[k]) * f;
		}
	}
	return { trace, centres, values };
}

/**
 * Phase-shuffled surrogate: randomise the Fourier phases while keeping the
 * amplitude spectrum. The result has the same power spectrum and therefore the
 * same autocorrelation as the original, but any genuine coupling to another
 * signal is destroyed.
 *
 * This is what makes a coupling number mean anything. Estimators like MI are
 * biased upward on smooth, autocorrelated signals, so "MI = 0.3" is not
 * evidence of anything until you know what MI this pair produces when the
 * coupling is removed but the spectrum is not. `HNA.surrogates` does this.
 */
export function phaseShuffle(x: number[], seed: number): number[] {
	const n = x.length;
	const N = nextPow2(n);
	const re = new Float64Array(N);
	const im = new Float64Array(N);
	for (let i = 0; i < n; i++) re[i] = x[i];

	fft(re, im);

	const rand = mulberry32(seed);
	const half = N >> 1;
	for (let k = 1; k < half; k++) {
		const mag = Math.hypot(re[k], im[k]);
		const ang = rand() * 2 * Math.PI;
		re[k] = mag * Math.cos(ang);
		im[k] = mag * Math.sin(ang);
		// Keep the spectrum conjugate-symmetric so the inverse is real.
		re[N - k] = re[k];
		im[N - k] = -im[k];
	}

	fft(re, im, true);

	const out = new Array<number>(n);
	for (let i = 0; i < n; i++) out[i] = re[i];
	return out;
}

/* ------------------------------------------------------------------ shapes */

/**
 * Round a coordinate before it reaches the DOM.
 *
 * Not cosmetic. `Math.sin`, `Math.log` and `Math.pow` are not required by the
 * spec to be correctly rounded, and Node and the browser disagree in the last
 * unit in the last place. Those differences survive into rendered `cx`/`cy`
 * attributes, and React compares server and client markup as strings during
 * hydration — so `14.262075314012815` against `14.26207531401283` is a
 * hydration mismatch, logged as an error and left unpatched. Two decimals of
 * a pixel is far below anything visible and puts both engines on the same
 * string. `toPath` above rounds for the same reason.
 */
export function px(n: number): number {
	return Math.round(n * 100) / 100;
}

/** Map a series into an SVG path across a box, with optional explicit y range. */
export function toPath(
	values: number[],
	width: number,
	height: number,
	yMin?: number,
	yMax?: number,
	padY = 2
): string {
	if (values.length === 0) return "";
	const lo = yMin ?? Math.min(...values);
	const hi = yMax ?? Math.max(...values);
	const range = hi - lo || 1;
	const dx = width / (values.length - 1 || 1);
	let d = "";
	for (let i = 0; i < values.length; i++) {
		const x = i * dx;
		const y = padY + (height - padY * 2) * (1 - (values[i] - lo) / range);
		d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
	}
	return d;
}
