"use client";

import { useMemo, useState } from "react";
import { Figure, Slider, Readout, SERIES_COLOR } from "./_ui";
import { FieldCanvas } from "./_FieldCanvas";
import { coloredNoise, toPath, px } from "./_signals";
import { synthesizeImage, radialPSD, tracePSD } from "./_fields";

/**
 * One slope, two media.
 *
 * The left half synthesises an image whose 2-D power spectrum falls as 1/k^beta
 * and measures the slope back out of it. The right half does exactly the same
 * thing to a sound, one axis instead of two. The control drives both, which is
 * the argument: the structure people call "natural" is a statement about how
 * power is distributed across scales, and it is the same statement whether the
 * scales are spatial or temporal.
 */

const N = 96;
const AUDIO_N = 2048;
const AUDIO_FS = 256;
const W = 300;
const H = 150;

export function SpatialFrequency() {
	const [beta, setBeta] = useState(2);

	const image = useMemo(() => synthesizeImage(N, beta, 11), [beta]);
	const psd2d = useMemo(() => radialPSD(image, N), [image]);

	const sound = useMemo(() => coloredNoise(AUDIO_N, beta, 23), [beta]);
	const psd1d = useMemo(() => tracePSD(sound, AUDIO_FS, 0.2, 120), [sound]);

	// Log-log path for the 2-D radial spectrum.
	const imagePath = useMemo(() => {
		const lx = psd2d.k.map((v) => Math.log10(v));
		const ly = psd2d.power.map((v) => Math.log10(v || 1e-20));
		const xLo = Math.min(...lx);
		const xHi = Math.max(...lx);
		const yLo = Math.min(...ly);
		const yHi = Math.max(...ly);
		let d = "";
		for (let i = 0; i < lx.length; i++) {
			const x = px(28 + ((lx[i] - xLo) / (xHi - xLo || 1)) * (W - 40));
			const y = px(H - 24 - ((ly[i] - yLo) / (yHi - yLo || 1)) * (H - 40));
			d += `${i === 0 ? "M" : "L"}${x} ${y}`;
		}
		return d;
	}, [psd2d]);

	const soundPath = useMemo(() => {
		const pts = psd1d.freqs
			.map((f, i) => [f, psd1d.power[i]] as const)
			.filter(([f]) => f >= 0.4 && f <= 100);
		const lx = pts.map(([f]) => Math.log10(f));
		const ly = pts.map(([, p]) => Math.log10(p || 1e-20));
		const xLo = Math.min(...lx);
		const xHi = Math.max(...lx);
		const yLo = Math.min(...ly);
		const yHi = Math.max(...ly);
		let d = "";
		for (let i = 0; i < lx.length; i++) {
			const x = px(28 + ((lx[i] - xLo) / (xHi - xLo || 1)) * (W - 40));
			const y = px(H - 24 - ((ly[i] - yLo) / (yHi - yLo || 1)) * (H - 40));
			d += `${i === 0 ? "M" : "L"}${x} ${y}`;
		}
		return d;
	}, [psd1d]);

	const character =
		beta < 0.6
			? "Static. Every scale carries the same power, so there is no structure at any size."
			: beta < 1.5
				? "Grainy but organised. Some large-scale structure has appeared without swamping the fine detail."
				: beta < 2.6
					? "This is the range photographs of natural scenes fall into. Structure at every scale, none of it dominating."
					: "Smooth to the point of being featureless. Nearly all the power is in the largest scales.";

	return (
		<Figure
			label="One slope, two media · spatial and temporal spectra"
			controls={
				<Slider
					label="Spectral slope β"
					value={beta}
					min={0}
					max={3.5}
					step={0.05}
					onChange={setBeta}
					format={(v) => v.toFixed(2)}
				/>
			}
			caption={
				<>
					Neither of these was drawn or recorded. Both were built by shaping noise so
					that power falls as 1/f<sup>β</sup>, and then measured to check the slope came
					back out. That is the whole content of the claim that natural signals are
					scale-free: not that they contain any particular thing, but that no scale is
					privileged. Photographs of natural scenes cluster near β = 2, and so do a
					great many natural sounds.
				</>
			}
		>
			<div className="grid gap-6 sm:grid-cols-2">
				<div>
					<p className="mb-2 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						Space · a synthesised image
					</p>
					<FieldCanvas
						field={image}
						N={N}
						ramp="mono"
						height={150}
						label={`A synthesised texture with spectral slope beta of ${beta.toFixed(2)}.`}
					/>
					<svg
						viewBox={`0 0 ${W} ${H}`}
						className="mt-3 w-full"
						role="img"
						aria-label={`Radially averaged power spectrum, measured slope ${psd2d.slope.toFixed(2)}.`}
					>
						<line x1={28} y1={H - 24} x2={W - 8} y2={H - 24} stroke="currentColor" className="text-rule" strokeWidth={1} />
						<line x1={28} y1={12} x2={28} y2={H - 24} stroke="currentColor" className="text-rule" strokeWidth={1} />
						<path d={imagePath} fill="none" stroke={SERIES_COLOR.world} strokeWidth={2} />
						<text x={W / 2} y={H - 6} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 9 }}>
							log spatial frequency
						</text>
					</svg>
					<div className="mt-2">
						<Readout
							items={[
								{ label: "Measured slope", value: psd2d.slope.toFixed(2), series: "world" },
								{ label: "Set to", value: (-beta).toFixed(2), muted: true },
							]}
						/>
					</div>
				</div>

				<div>
					<p className="mb-2 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						Time · a synthesised sound
					</p>
					<svg
						viewBox={`0 0 ${W} 150`}
						className="w-full"
						role="img"
						aria-label={`A synthesised signal with spectral slope beta of ${beta.toFixed(2)}.`}
						style={{ height: 150 }}
					>
						<path
							d={toPath(sound, W, 150, -3.4, 3.4)}
							fill="none"
							stroke={SERIES_COLOR.body}
							strokeWidth={1.2}
						/>
					</svg>
					<svg
						viewBox={`0 0 ${W} ${H}`}
						className="mt-3 w-full"
						role="img"
						aria-label="Power spectrum of the synthesised sound."
					>
						<line x1={28} y1={H - 24} x2={W - 8} y2={H - 24} stroke="currentColor" className="text-rule" strokeWidth={1} />
						<line x1={28} y1={12} x2={28} y2={H - 24} stroke="currentColor" className="text-rule" strokeWidth={1} />
						<path d={soundPath} fill="none" stroke={SERIES_COLOR.body} strokeWidth={2} />
						<text x={W / 2} y={H - 6} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 9 }}>
							log temporal frequency
						</text>
					</svg>
					<div className="mt-2">
						<Readout
							items={[{ label: "Same β", value: beta.toFixed(2), series: "body" }]}
						/>
					</div>
				</div>
			</div>

			<p className="mt-4 border-t border-rule pt-4 font-serif text-[15px] leading-relaxed text-foreground/85">
				{character}
			</p>
		</Figure>
	);
}
