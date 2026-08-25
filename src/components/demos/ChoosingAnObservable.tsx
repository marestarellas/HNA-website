"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Figure, Legend, Slider, Baseline, SERIES_COLOR } from "./_ui";
import { toPath, px } from "./_signals";
import { buildSound, buildEeg, buildEcg, FS, N, type Observable } from "./_observables";

/**
 * Step two of the Learn page: three signals that look nothing alike, each
 * reduced to a slow trace comparable with any of the others.
 *
 * Three tabs rather than one generic waveform because the *observable is not
 * the same operation each time*. A sound gives up its envelope directly. An EEG
 * has to be band-limited first, because what waxes and wanes is the power in
 * one rhythm, not the whole trace. An ECG is not an amplitude problem at all —
 * the information is in the spacing between beats. Applying a Hilbert transform
 * to all three would be tidy and wrong, and a reader who took that away would
 * carry the mistake into their own data.
 *
 * The signal maths lives in `_observables.ts` so a harness can verify it.
 */

const W = 720;
const H_RAW = 104;
const H_OBS = 84;

type Kind = "sound" | "eeg" | "ecg";

const TABS: { id: Kind; label: string }[] = [
	{ id: "sound", label: "Sound" },
	{ id: "eeg", label: "EEG" },
	{ id: "ecg", label: "ECG" },
];

const COPY: Record<
	Kind,
	{
		rawLabel: string;
		obsLabel: string;
		control: { label: string; min: number; max: number; step: number; unit: string };
		note: ReactNode;
	}
> = {
	sound: {
		rawLabel: "Pressure at the microphone",
		obsLabel: "Amplitude envelope",
		control: { label: "Swell rate", min: 0.2, max: 4, step: 0.05, unit: " Hz" },
		note: (
			<>
				A broadband sound — surf, wind, rain — is mostly roughness. What changes
				slowly, and what a listener actually attends to, is how <em>loud</em> it is
				from moment to moment. A Hilbert transform reads that off the trace directly.
			</>
		),
	},
	eeg: {
		rawLabel: "Voltage at the scalp",
		obsLabel: "Alpha-band (8–12 Hz) power",
		control: { label: "Burst rate", min: 0.15, max: 1.5, step: 0.05, unit: " Hz" },
		note: (
			<>
				A raw EEG is several rhythms at once plus a 1/f background, and its overall
				amplitude means little. What rises and falls is the power in <em>one band</em>{" "}
				— so the band is isolated first, and only then does an envelope answer a real
				question. Take the envelope of the unfiltered trace and you would be
				measuring the background as much as the rhythm.
			</>
		),
	},
	ecg: {
		rawLabel: "Voltage at the chest",
		obsLabel: "Instantaneous heart rate (bpm)",
		control: { label: "Breathing rate", min: 0.1, max: 0.5, step: 0.01, unit: " Hz" },
		note: (
			<>
				Here an envelope is the wrong idea entirely. An ECG&rsquo;s amplitude says
				little; the information is in <em>when</em> each beat arrives. Measure the
				gaps — marked above — and a slow rhythm appears that is nowhere visible in
				the trace: the heart speeding up on the in-breath and slowing on the out.
				The same reduction to a slow trace, reached a completely different way.
			</>
		),
	},
};

export function ChoosingAnObservable() {
	const [kind, setKind] = useState<Kind>("sound");
	const [rates, setRates] = useState<Record<Kind, number>>({
		sound: 0.7,
		eeg: 0.5,
		ecg: 0.25,
	});

	const built = useMemo<Observable>(() => {
		if (kind === "eeg") return buildEeg(rates.eeg);
		if (kind === "ecg") return buildEcg(rates.ecg);
		return buildSound(rates.sound);
	}, [kind, rates]);

	const copy = COPY[kind];
	const { raw, observable, overlay, marks } = built;

	const rawLo = Math.min(...raw);
	const rawHi = Math.max(...raw);
	const overlayScaled = useMemo(() => {
		if (!overlay) return null;
		const m = Math.max(...overlay) || 1;
		return overlay.map((v) => (v / m) * rawHi);
	}, [overlay, rawHi]);

	const obsLo = Math.min(...observable);
	const obsHi = Math.max(...observable);

	return (
		<Figure
			label="What you compare · one slow trace from any signal"
			controls={
				<>
					<div className="flex flex-wrap gap-2">
						{TABS.map((t) => (
							<button
								key={t.id}
								type="button"
								onClick={() => setKind(t.id)}
								aria-pressed={kind === t.id}
								className={[
									"rounded-full border px-3 py-1 font-sans text-[11px] transition-colors",
									kind === t.id
										? "border-foreground bg-foreground text-background"
										: "border-rule text-muted hover:text-foreground",
								].join(" ")}
							>
								{t.label}
							</button>
						))}
					</div>
					<Slider
						label={copy.control.label}
						value={rates[kind]}
						min={copy.control.min}
						max={copy.control.max}
						step={copy.control.step}
						onChange={(v) => setRates((r) => ({ ...r, [kind]: v }))}
						format={(v) => `${v.toFixed(2)}${copy.control.unit}`}
					/>
					<Legend
						items={[
							{ key: "world", label: copy.rawLabel },
							{ key: "result", label: copy.obsLabel },
						]}
					/>
				</>
			}
			caption={copy.note}
		>
			<p className="mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
				What you record
			</p>
			<svg
				viewBox={`0 0 ${W} ${H_RAW}`}
				className="w-full"
				role="img"
				aria-label={`${copy.rawLabel}: a raw ${kind} trace.`}
			>
				<Baseline width={W} y={H_RAW / 2} />
				<path
					d={toPath(raw, W, H_RAW, rawLo, rawHi)}
					fill="none"
					stroke={SERIES_COLOR.world}
					strokeWidth={kind === "sound" ? 1 : 1.4}
					opacity={kind === "sound" ? 0.55 : 0.9}
				/>
				{overlayScaled && (
					<>
						<path
							d={toPath(overlayScaled, W, H_RAW, rawLo, rawHi)}
							fill="none"
							stroke={SERIES_COLOR.result}
							strokeWidth={2}
						/>
						<path
							d={toPath(
								overlayScaled.map((v) => -v),
								W,
								H_RAW,
								rawLo,
								rawHi
							)}
							fill="none"
							stroke={SERIES_COLOR.result}
							strokeWidth={2}
							opacity={0.4}
						/>
					</>
				)}
				{marks?.map((i) => (
					<line
						key={i}
						x1={px((i / (N - 1)) * W)}
						y1={4}
						x2={px((i / (N - 1)) * W)}
						y2={H_RAW - 4}
						stroke={SERIES_COLOR.result}
						strokeWidth={1}
						strokeDasharray="2 3"
						opacity={0.55}
					/>
				))}
			</svg>

			<p className="mt-4 mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
				What you compare
			</p>
			<svg
				viewBox={`0 0 ${W} ${H_OBS}`}
				className="w-full"
				role="img"
				aria-label={`${copy.obsLabel}, extracted from the trace above.`}
			>
				<path
					d={toPath(observable, W, H_OBS, obsLo, obsHi)}
					fill="none"
					stroke={SERIES_COLOR.result}
					strokeWidth={2}
				/>
			</svg>
			<div className="mt-1 flex justify-between font-sans text-[10px] text-muted">
				<span>0 s</span>
				<span>
					{kind === "ecg"
						? `${obsLo.toFixed(0)}–${obsHi.toFixed(0)} bpm`
						: "arbitrary units"}
				</span>
				<span>{(N / FS).toFixed(0)} s</span>
			</div>
		</Figure>
	);
}
