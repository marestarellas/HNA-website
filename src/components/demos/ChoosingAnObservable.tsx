"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Figure, Legend, Slider, Baseline, SERIES_COLOR } from "./_ui";
import { toPath, px } from "./_signals";
import {
	record,
	feature,
	BAND,
	FS,
	N,
	type Kind,
	type Feature,
} from "./_observables";

/**
 * Step two of the Learn page. Two selectors, because two independent choices
 * are being made and collapsing them is the misconception this figure exists to
 * prevent:
 *
 *   Which signal  — each modality needs a different first move to become a
 *                   one-dimensional trace at all.
 *   Which feature — having got a trace, you still choose what about it to
 *                   compare. These are the feature rows of the design-space
 *                   grid in step 07.
 *
 * Every combination produces a series of the same shape, which is why any of
 * them can be fed to any coupling method later.
 */

const W = 720;
const H_RAW = 100;
const H_OBS = 80;

const SIGNALS: { id: Kind; label: string }[] = [
	{ id: "sound", label: "Sound" },
	{ id: "eeg", label: "EEG" },
	{ id: "ecg", label: "ECG" },
];

const FEATURES: { id: Feature; label: string }[] = [
	{ id: "raw", label: "The trace itself" },
	{ id: "band", label: "Power in a band" },
	{ id: "complexity", label: "Complexity" },
];

const SIGNAL_COPY: Record<
	Kind,
	{
		rawLabel: string;
		baseLabel: string;
		control: { label: string; min: number; max: number; step: number };
		firstMove: ReactNode;
	}
> = {
	sound: {
		rawLabel: "Pressure at the microphone",
		baseLabel: "the waveform",
		control: { label: "Swell rate", min: 0.2, max: 4, step: 0.05 },
		firstMove: (
			<>
				A sound is already a one-dimensional trace, so no reduction is needed before
				choosing a feature.
			</>
		),
	},
	eeg: {
		rawLabel: "Voltage at the scalp",
		baseLabel: "the voltage trace",
		control: { label: "Burst rate", min: 0.15, max: 1.5, step: 0.05 },
		firstMove: (
			<>
				An EEG is also already one-dimensional — but its overall amplitude means
				little, since several rhythms and a 1/f background are summed into it. Which
				is why the band matters so much here.
			</>
		),
	},
	ecg: {
		rawLabel: "Voltage at the chest",
		baseLabel: "instantaneous heart rate",
		control: { label: "Breathing rate", min: 0.1, max: 0.5, step: 0.01 },
		firstMove: (
			<>
				An ECG is <em>not</em> usable as it stands. Its information is in{" "}
				<em>when</em> each beat arrives, not how large it is, so the first move is to
				measure the gaps between the marked beats and turn them into instantaneous
				rate. Everything below is computed from that.
			</>
		),
	},
};

const FEATURE_COPY: Record<Feature, (kind: Kind) => ReactNode> = {
	raw: (kind) => (
		<>
			The trace as it stands, with nothing extracted. A perfectly legitimate choice —
			the linear and information families are usually applied at exactly this level.
			{kind === "ecg" && " Here that means the rate series, not the ECG waveform."}
		</>
	),
	band: (kind) => (
		<>
			How much energy sits in {BAND[kind].name}, moment to moment — a frequency
			component followed over time. Band-pass, then take the envelope. Note what this
			trace is and is not: it is the <em>strength</em> of that component, not the
			component itself, so a steady rhythm gives a steady line.{" "}
			{kind === "ecg" ? (
				<>
					This band is where respiratory sinus arrhythmia is measured clinically. Drag
					the breathing rate below 0.15 Hz or above 0.45 and watch the level collapse
					— the rhythm has not stopped, it has simply left the window you chose to
					look through. Choosing a band is choosing what you are able to see.
				</>
			) : (
				<>Raising the control makes the band&rsquo;s power rise and fall faster.</>
			)}
		</>
	),
	complexity: () => (
		<>
			The scaling exponent, recomputed in a sliding two-second window. Complexity as
			a <em>time series</em> rather than one number for the whole recording — which is
			what makes it something you can couple on at all, since a single value per
			recording has nothing to be correlated against.
		</>
	),
};

/**
 * Declared at module scope, not inside the component below.
 *
 * A component defined in another component's body is a *new component type* on
 * every render, so React tears the old one down and mounts a fresh one each
 * time instead of updating it. Beyond the wasted work, the DOM nodes are
 * replaced on every state change — which silently breaks anything holding a
 * reference to them, focus included.
 */
function Pills<T extends string>({
	items,
	value,
	onPick,
}: {
	items: { id: T; label: string }[];
	value: T;
	onPick: (v: T) => void;
}) {
	return (
		<div className="flex flex-wrap gap-2">
			{items.map((it) => (
				<button
					key={it.id}
					type="button"
					onClick={() => onPick(it.id)}
					aria-pressed={value === it.id}
					className={[
						"rounded-full border px-3 py-1 font-sans text-[11px] transition-colors",
						value === it.id
							? "border-foreground bg-foreground text-background"
							: "border-rule text-muted hover:text-foreground",
					].join(" ")}
				>
					{it.label}
				</button>
			))}
		</div>
	);
}

export function ChoosingAnObservable() {
	const [kind, setKind] = useState<Kind>("sound");
	const [which, setWhich] = useState<Feature>("raw");
	const [controls, setControls] = useState<Record<Kind, number>>({
		sound: 0.7,
		eeg: 0.5,
		ecg: 0.25,
	});

	const rec = useMemo(() => record(kind, controls[kind]), [kind, controls]);
	const series = useMemo(() => feature(rec, kind, which), [rec, kind, which]);

	const copy = SIGNAL_COPY[kind];
	const rawLo = Math.min(...rec.raw);
	const rawHi = Math.max(...rec.raw);
	const obsLo = Math.min(...series);
	const obsHi = Math.max(...series);

	const unit =
		which === "complexity"
			? `α ${obsLo.toFixed(2)}–${obsHi.toFixed(2)}`
			: kind === "ecg" && which === "raw"
				? `${obsLo.toFixed(0)}–${obsHi.toFixed(0)} bpm`
				: "arbitrary units";

	return (
		<Figure
			label="What you compare · signal × feature"
			controls={
				<>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
						<span className="w-20 shrink-0 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
							Signal
						</span>
						<Pills items={SIGNALS} value={kind} onPick={setKind} />
					</div>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
						<span className="w-20 shrink-0 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
							Feature
						</span>
						<Pills items={FEATURES} value={which} onPick={setWhich} />
					</div>
					<Slider
						label={copy.control.label}
						value={controls[kind]}
						min={copy.control.min}
						max={copy.control.max}
						step={copy.control.step}
						onChange={(v) => setControls((c) => ({ ...c, [kind]: v }))}
						format={(v) => `${v.toFixed(2)} Hz`}
					/>
					<Legend
						items={[
							{ key: "world", label: copy.rawLabel },
							{ key: "result", label: FEATURES.find((f) => f.id === which)!.label },
						]}
					/>
				</>
			}
			caption={
				<>
					{copy.firstMove} {FEATURE_COPY[which](kind)}
				</>
			}
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
					d={toPath(rec.raw, W, H_RAW, rawLo, rawHi)}
					fill="none"
					stroke={SERIES_COLOR.world}
					strokeWidth={kind === "sound" ? 1 : 1.4}
					opacity={kind === "sound" ? 0.55 : 0.9}
				/>
				{rec.marks?.map((i) => (
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
				What you compare — {FEATURES.find((f) => f.id === which)!.label.toLowerCase()}
				{which !== "raw" && <> of {copy.baseLabel}</>}
			</p>
			<svg
				viewBox={`0 0 ${W} ${H_OBS}`}
				className="w-full"
				role="img"
				aria-label={`${FEATURES.find((f) => f.id === which)!.label} derived from the trace above.`}
			>
				<path
					d={toPath(series, W, H_OBS, obsLo, obsHi)}
					fill="none"
					stroke={SERIES_COLOR.result}
					strokeWidth={2}
				/>
			</svg>
			<div className="mt-1 flex justify-between font-sans text-[10px] text-muted">
				<span>0 s</span>
				<span>{unit}</span>
				<span>{(N / FS).toFixed(0)} s</span>
			</div>
		</Figure>
	);
}
