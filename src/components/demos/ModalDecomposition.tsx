"use client";

import { useMemo, useState } from "react";
import { Figure, Slider, Readout, SERIES_COLOR } from "./_ui";
import { FieldCanvas } from "./_FieldCanvas";
import { toPath } from "./_signals";
import { waveField, podModes, tracePSD } from "./_fields";

/**
 * A moving scene as a small number of fixed spatial patterns whose brightnesses
 * oscillate.
 *
 * The instructive surprise is that a single travelling wave comes back as a
 * PAIR of modes carrying nearly equal energy. A standing pattern cannot travel;
 * to move a crest across the frame you need two standing patterns a quarter
 * cycle apart in both space and time, adding and cancelling as they go. Seeing
 * energies split roughly 40/40 and then 8/8 is not a failure to separate the
 * swell from the chop. It is the decomposition doing exactly what it should.
 */

const N = 40;
const T = 160;
const FPS = 12;
const K = 4;
const W = 260;
const H = 64;

export function ModalDecomposition() {
	const [swell, setSwell] = useState(0.3);
	const [chop, setChop] = useState(0.45);

	const wf = useMemo(() => waveField(N, T, FPS, swell, chop), [swell, chop]);
	const pod = useMemo(() => podModes(wf.frames, K), [wf]);

	const peaks = useMemo(
		() => pod.temporal.map((c) => tracePSD(c, FPS, 0.05, 4).peakHz),
		[pod]
	);

	const chopHz = swell * 2.7;

	return (
		<Figure
			label="Modal decomposition · a scene as a few oscillating patterns"
			controls={
				<>
					<Slider
						label="Swell rate"
						value={swell}
						min={0.12}
						max={0.6}
						step={0.01}
						onChange={setSwell}
						format={(v) => `${v.toFixed(2)} Hz`}
					/>
					<Slider
						label="Chop"
						value={chop}
						min={0}
						max={1.2}
						step={0.05}
						onChange={setChop}
						format={(v) => v.toFixed(2)}
					/>
				</>
			}
			caption={
				<>
					Modes arrive in pairs with matched energies and matched frequencies, and that
					is the correct answer rather than a defect. A standing pattern cannot travel,
					so a moving crest needs two of them offset by a quarter cycle, taking turns.
					Read the pairs rather than the individual modes: the first pair is the swell,
					the second is the chop, and their frequencies land where you set them. Turn
					the chop to zero and the second pair loses almost all its energy.
				</>
			}
		>
			<div className="grid gap-4 sm:grid-cols-2">
				{pod.spatial.map((mode, i) => (
					<div key={i} className="flex gap-3">
						<div className="w-[84px] shrink-0">
							<FieldCanvas
								field={mode}
								N={N}
								height={84}
								label={`Spatial mode ${i + 1}.`}
							/>
						</div>
						<div className="min-w-0 flex-1">
							<p className="font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
								Mode {i + 1} · {(pod.energy[i] * 100).toFixed(1)}% of variance
							</p>
							<svg
								viewBox={`0 0 ${W} ${H}`}
								className="mt-1 w-full"
								role="img"
								aria-label={`Temporal coefficient of mode ${i + 1}, oscillating at ${peaks[i].toFixed(2)} hertz.`}
							>
								<path
									d={toPath(pod.temporal[i], W, H)}
									fill="none"
									stroke={i < 2 ? SERIES_COLOR.world : SERIES_COLOR.body}
									strokeWidth={1.6}
								/>
							</svg>
							<p className="mt-1 font-sans text-[11px] tabular-nums text-foreground">
								{peaks[i].toFixed(2)} Hz
							</p>
						</div>
					</div>
				))}
			</div>

			<div className="mt-4 border-t border-rule pt-4">
				<Readout
					items={[
						{ label: "Swell set to", value: `${swell.toFixed(2)} Hz`, series: "world" },
						{ label: "Chop set to", value: `${chopHz.toFixed(2)} Hz`, series: "body" },
						{
							label: "First pair",
							value: `${((pod.energy[0] + pod.energy[1]) * 100).toFixed(0)}%`,
							muted: true,
						},
						{
							label: "Second pair",
							value: `${((pod.energy[2] + pod.energy[3]) * 100).toFixed(0)}%`,
							muted: true,
						},
					]}
				/>
			</div>
		</Figure>
	);
}
