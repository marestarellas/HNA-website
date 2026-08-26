/**
 * Two-dimensional signal processing for the "oscillations in natural images
 * and sounds" page.
 *
 * A scene is a block of numbers indexed by x, y and t. Nothing here can be
 * compared with a heartbeat until that block becomes one number per frame, and
 * these are the operations that do the reducing: spatial spectra, timestacks,
 * proper orthogonal decomposition.
 *
 * As in `_signals.ts`, everything computes for real and everything is seeded,
 * so a figure can be checked against a known answer and a reader who drags a
 * control back gets the same picture.
 */

import { fft, mulberry32, gaussian, mean, zscore } from "./_signals";

/* ------------------------------------------------------------------- fft2 */

function nextPow2(n: number): number {
	let p = 1;
	while (p < n) p <<= 1;
	return p;
}

/**
 * In-place 2-D FFT of a square N x N field, by transforming rows then columns.
 * A 2-D transform separates exactly this way, which is why images can be
 * analysed with the same one-dimensional machinery as sound.
 */
export function fft2(re: Float64Array, im: Float64Array, N: number, inverse = false): void {
	const rowRe = new Float64Array(N);
	const rowIm = new Float64Array(N);

	for (let y = 0; y < N; y++) {
		for (let x = 0; x < N; x++) {
			rowRe[x] = re[y * N + x];
			rowIm[x] = im[y * N + x];
		}
		fft(rowRe, rowIm, inverse);
		for (let x = 0; x < N; x++) {
			re[y * N + x] = rowRe[x];
			im[y * N + x] = rowIm[x];
		}
	}

	for (let x = 0; x < N; x++) {
		for (let y = 0; y < N; y++) {
			rowRe[y] = re[y * N + x];
			rowIm[y] = im[y * N + x];
		}
		fft(rowRe, rowIm, inverse);
		for (let y = 0; y < N; y++) {
			re[y * N + x] = rowRe[y];
			im[y * N + x] = rowIm[y];
		}
	}
}

/* -------------------------------------------------------- image synthesis */

/**
 * A square image whose 2-D power spectrum falls as 1/f^beta.
 *
 * beta = 0 is white noise, which looks like television static. Photographs of
 * natural scenes sit near beta = 2, and the reason that number keeps appearing
 * is the point of the figure that uses this: shape the spectrum and the texture
 * follows, without ever drawing an object.
 */
export function synthesizeImage(N: number, beta: number, seed: number): Float64Array {
	const size = nextPow2(N);
	const re = new Float64Array(size * size);
	const im = new Float64Array(size * size);
	const rand = mulberry32(seed);
	for (let i = 0; i < size * size; i++) re[i] = gaussian(rand);

	fft2(re, im, size);

	const half = size / 2;
	for (let y = 0; y < size; y++) {
		const fy = y <= half ? y : y - size;
		for (let x = 0; x < size; x++) {
			const fx = x <= half ? x : x - size;
			const k = Math.hypot(fx, fy);
			const s = k === 0 ? 0 : Math.pow(k, -beta / 2);
			re[y * size + x] *= s;
			im[y * size + x] *= s;
		}
	}

	fft2(re, im, size, true);

	const out = new Float64Array(N * N);
	for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) out[y * N + x] = re[y * size + x];

	// Normalise to zero mean, unit variance so the display mapping is stable.
	const m = mean(Array.from(out));
	let ss = 0;
	for (const v of out) ss += (v - m) * (v - m);
	const sd = Math.sqrt(ss / out.length) || 1;
	for (let i = 0; i < out.length; i++) out[i] = (out[i] - m) / sd;
	return out;
}

/**
 * Radially averaged power spectrum, and the slope of log power against log
 * spatial frequency. Recovering the beta that `synthesizeImage` was given is
 * how that figure proves it is measuring rather than asserting.
 */
export function radialPSD(field: Float64Array, N: number): {
	k: number[];
	power: number[];
	slope: number;
} {
	const re = Float64Array.from(field);
	const im = new Float64Array(N * N);
	fft2(re, im, N);

	const half = N / 2;
	const nBins = Math.floor(half) - 1;
	const sum = new Float64Array(nBins + 1);
	const count = new Float64Array(nBins + 1);

	for (let y = 0; y < N; y++) {
		const fy = y <= half ? y : y - N;
		for (let x = 0; x < N; x++) {
			const fx = x <= half ? x : x - N;
			const k = Math.round(Math.hypot(fx, fy));
			if (k < 1 || k > nBins) continue;
			const i = y * N + x;
			sum[k] += re[i] * re[i] + im[i] * im[i];
			count[k] += 1;
		}
	}

	const ks: number[] = [];
	const power: number[] = [];
	for (let k = 1; k <= nBins; k++) {
		if (count[k] === 0) continue;
		ks.push(k);
		power.push(sum[k] / count[k]);
	}

	// Least-squares slope in log-log, over the middle of the range where the
	// estimate is not distorted by the DC neighbourhood or by the Nyquist edge.
	const lo = Math.max(0, Math.floor(ks.length * 0.08));
	const hi = Math.floor(ks.length * 0.75);
	const lx: number[] = [];
	const ly: number[] = [];
	for (let i = lo; i < hi; i++) {
		lx.push(Math.log10(ks[i]));
		ly.push(Math.log10(power[i] || 1e-20));
	}
	const mx = mean(lx);
	const my = mean(ly);
	let num = 0;
	let den = 0;
	for (let i = 0; i < lx.length; i++) {
		num += (lx[i] - mx) * (ly[i] - my);
		den += (lx[i] - mx) * (lx[i] - mx);
	}
	return { k: ks, power, slope: den === 0 ? 0 : num / den };
}

/* ----------------------------------------------------------- wave fields */

export type WaveField = {
	/** frames[t][y * N + x], values roughly in [-1, 1]. */
	frames: Float64Array[];
	N: number;
	fps: number;
};

/**
 * A small sea surface: one dominant swell travelling across the frame, plus a
 * faster shorter-crested chop and a little texture. Synthetic, but built the
 * way a sea actually is, as a sum of travelling components rather than a
 * picture of one.
 *
 * `swellHz` is the temporal frequency of the dominant component, which is what
 * the timestack figure sets out to recover.
 */
export function waveField(
	N: number,
	nFrames: number,
	fps: number,
	swellHz: number,
	chopAmp: number,
	seed = 4
): WaveField {
	const rand = mulberry32(seed);
	const texture = new Float64Array(N * N);
	for (let i = 0; i < N * N; i++) texture[i] = gaussian(rand);

	// Swell: long crests, travelling left to right, slightly oblique.
	const kSwell = (2 * Math.PI * 2.0) / N; // ~2 crests across the frame
	const thetaS = 0.18;
	// Chop: shorter, faster, travelling at an angle.
	const kChop = (2 * Math.PI * 6.0) / N;
	const thetaC = -0.7;
	const chopHz = swellHz * 2.7;

	const frames: Float64Array[] = [];
	for (let t = 0; t < nFrames; t++) {
		const time = t / fps;
		const f = new Float64Array(N * N);
		for (let y = 0; y < N; y++) {
			for (let x = 0; x < N; x++) {
				const ps = kSwell * (x * Math.cos(thetaS) + y * Math.sin(thetaS));
				const pc = kChop * (x * Math.cos(thetaC) + y * Math.sin(thetaC));
				f[y * N + x] =
					Math.sin(ps - 2 * Math.PI * swellHz * time) +
					chopAmp * Math.sin(pc - 2 * Math.PI * chopHz * time) +
					0.12 * texture[y * N + x];
			}
		}
		frames.push(f);
	}
	return { frames, N, fps };
}

/* ------------------------------------------------------------ timestack */

/**
 * The oceanographer's trick. Sample one pixel column at every frame and stack
 * those columns side by side: the resulting image has space down one axis and
 * time along the other, so a wave passing the column becomes a visible stripe.
 * Collapsing it to a row mean gives a 1-D signal whose spectral peak is the
 * wave frequency.
 *
 * What makes it worth teaching is how little it throws away for how much it
 * gains. One column out of a whole scene, and the period falls out.
 */
export function timestack(
	wf: WaveField,
	column: number
): { image: Float64Array; width: number; height: number; trace: number[] } {
	const { frames, N } = wf;
	const T = frames.length;
	const image = new Float64Array(N * T); // [y * T + t]
	const trace: number[] = [];

	for (let t = 0; t < T; t++) {
		let acc = 0;
		for (let y = 0; y < N; y++) {
			const v = frames[t][y * N + column];
			image[y * T + t] = v;
			acc += v;
		}
		trace.push(acc / N);
	}
	return { image, width: T, height: N, trace };
}

/**
 * Power spectrum of a 1-D trace, with the peak located inside a band. Returns
 * frequencies in Hz so a figure can report "the swell is at 0.30 Hz" rather
 * than a bin index.
 */
export function tracePSD(
	x: number[],
	fs: number,
	loHz = 0.05,
	hiHz = 2
): { freqs: number[]; power: number[]; peakHz: number } {
	const n = x.length;
	const N = nextPow2(n);
	const re = new Float64Array(N);
	const im = new Float64Array(N);
	const z = zscore(x);
	// Hann window, so a non-integer number of cycles does not smear the peak
	// across the whole spectrum.
	for (let i = 0; i < n; i++) re[i] = z[i] * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));

	fft(re, im);

	const freqs: number[] = [];
	const power: number[] = [];
	let peakHz = 0;
	let peakP = -1;
	for (let k = 1; k < N / 2; k++) {
		const f = (k * fs) / N;
		const p = re[k] * re[k] + im[k] * im[k];
		freqs.push(f);
		power.push(p);
		if (f >= loHz && f <= hiHz && p > peakP) {
			peakP = p;
			peakHz = f;
		}
	}
	return { freqs, power, peakHz };
}

/* ---------------------------------------------------------------- modes */

/**
 * Proper orthogonal decomposition by the method of snapshots.
 *
 * Rather than decomposing the (very tall) pixels-by-time matrix directly, take
 * the small time-by-time correlation matrix, find its leading eigenvectors by
 * power iteration with deflation, and project back. The eigenvectors ARE the
 * temporal coefficients, and the projections are the spatial modes.
 *
 * The point for a reader: a moving scene is often a handful of fixed spatial
 * patterns whose brightnesses oscillate. Finding them turns a video into a few
 * 1-D signals with no loss worth worrying about.
 */
export function podModes(
	frames: Float64Array[],
	k: number
): { spatial: Float64Array[]; temporal: number[][]; energy: number[] } {
	const T = frames.length;
	const P = frames[0].length;

	// Remove the temporal mean: modes should describe variation, not the scene.
	const meanFrame = new Float64Array(P);
	for (const f of frames) for (let i = 0; i < P; i++) meanFrame[i] += f[i] / T;
	const X = frames.map((f) => {
		const d = new Float64Array(P);
		for (let i = 0; i < P; i++) d[i] = f[i] - meanFrame[i];
		return d;
	});

	// C[i][j] = <X_i, X_j>, a T x T matrix.
	const C: number[][] = Array.from({ length: T }, () => new Array<number>(T).fill(0));
	for (let i = 0; i < T; i++) {
		for (let j = i; j < T; j++) {
			let s = 0;
			for (let p = 0; p < P; p++) s += X[i][p] * X[j][p];
			C[i][j] = s;
			C[j][i] = s;
		}
	}

	const totalEnergy = C.reduce((s, row, i) => s + row[i], 0) || 1;
	const spatial: Float64Array[] = [];
	const temporal: number[][] = [];
	const energy: number[] = [];
	const rand = mulberry32(17);

	for (let m = 0; m < k; m++) {
		// Power iteration for the leading eigenvector of the deflated C.
		let v = Array.from({ length: T }, () => gaussian(rand));
		let lambda = 0;
		for (let iter = 0; iter < 220; iter++) {
			const w = new Array<number>(T).fill(0);
			for (let i = 0; i < T; i++) {
				let s = 0;
				for (let j = 0; j < T; j++) s += C[i][j] * v[j];
				w[i] = s;
			}
			const norm = Math.hypot(...w) || 1;
			for (let i = 0; i < T; i++) w[i] = w[i] / norm;
			lambda = norm;
			v = w;
		}

		// Spatial mode = sum_t v_t * X_t, normalised.
		const mode = new Float64Array(P);
		for (let t = 0; t < T; t++) for (let p = 0; p < P; p++) mode[p] += v[t] * X[t][p];
		let mn = 0;
		for (const val of mode) mn += val * val;
		mn = Math.sqrt(mn) || 1;
		for (let p = 0; p < P; p++) mode[p] /= mn;

		// Temporal coefficient = projection of each frame onto the mode.
		const coeff: number[] = [];
		for (let t = 0; t < T; t++) {
			let s = 0;
			for (let p = 0; p < P; p++) s += X[t][p] * mode[p];
			coeff.push(s);
		}

		spatial.push(mode);
		temporal.push(coeff);
		energy.push(lambda / totalEnergy);

		// Deflate so the next iteration finds the next mode.
		for (let i = 0; i < T; i++) {
			for (let j = 0; j < T; j++) C[i][j] -= lambda * v[i] * v[j];
		}
	}

	return { spatial, temporal, energy };
}

/* ------------------------------------------------------------ reductions */

/** One number per frame: the spatial mean of |value|, a crude motion-free
 *  brightness proxy standing in for a luminance envelope. */
export function wholeImageTrace(frames: Float64Array[]): number[] {
	return frames.map((f) => {
		let s = 0;
		for (const v of f) s += Math.abs(v);
		return s / f.length;
	});
}

/** Frame-to-frame change: the raw-family motion measure. */
export function frameDifferenceTrace(frames: Float64Array[]): number[] {
	const out: number[] = [0];
	for (let t = 1; t < frames.length; t++) {
		let s = 0;
		for (let i = 0; i < frames[t].length; i++) {
			const d = frames[t][i] - frames[t - 1][i];
			s += d * d;
		}
		out.push(Math.sqrt(s / frames[t].length));
	}
	out[0] = out[1] ?? 0;
	return out;
}

/** Mean over one tile of a `tiles x tiles` grid. */
export function patchTrace(
	frames: Float64Array[],
	N: number,
	tiles: number,
	ti: number,
	tj: number
): number[] {
	const size = Math.floor(N / tiles);
	const x0 = tj * size;
	const y0 = ti * size;
	return frames.map((f) => {
		let s = 0;
		for (let y = y0; y < y0 + size; y++) {
			for (let x = x0; x < x0 + size; x++) s += f[y * N + x];
		}
		return s / (size * size);
	});
}

/** One pixel's own time series. */
export function pixelTrace(frames: Float64Array[], N: number, x: number, y: number): number[] {
	return frames.map((f) => f[y * N + x]);
}
