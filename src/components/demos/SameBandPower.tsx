"use client";

import { useMemo, useState } from "react";
import { Figure, Slider, SERIES_COLOR } from "./_ui";
import { px } from "./_signals";
import {
	freqAxis,
	synthSpectrum,
	fitSpectrum,
	aperiodicAt,
	bandPower,
	type Peak,
} from "./_spectra";

/**
 * Two spectra with the same alpha power and nothing else in common.
 *
 * Left: the peak grows while the background holds still. Right: the peak holds
 * still while the background flattens. The reader drags one control and both
 * panels move together, keeping band power matched between them, so the only
 * thing left to notice is that band power is the same and the cause is not.
 *
 * This is the whole page in one figure. Everything else is preparation for it.
 */

const F = freqAxis(1, 50, 0.5);
const BAND: [number, number] = [8, 12];
const BASE = { offset: 1.2, exponent: 1.5 };
const BASE_PEAK: Peak = { cf: 10, pw: 0.35, bw: 1.5 };

const W = 340;
const H = 200;
const X0 = 30;

function xOf(f: number): number {
	const lo = Math.log10(F[0]);
	const hi = Math.log10(F[F.length - 1]);
	return px(X0 + ((Math.log10(f) - lo) / (hi - lo)) * (W - X0 - 8));
}

/**
 * Find the peak height, and separately the background slope, that each produce
 * the requested band power. Bisection rather than algebra: band power is a sum
 * over a window of a model that is linear in neither parameter, and a search is
 * both shorter and obviously correct.
 */
function solveForBandPower(target: number): { pw: number; exponent: number } {
	let lo = BASE_PEAK.pw;
	let hi = 3;
	for (let i = 0; i < 40; i++) {
		const mid = (lo + hi) / 2;
		const s = synthSpectrum(F, BASE, [{ ...BASE_PEAK, pw: mid }]);
		if (bandPower(F, s, ...BAND) < target) lo = mid;
		else hi = mid;
	}
	const pw = (lo + hi) / 2;

	let elo = 0.2;
	let ehi = BASE.exponent;
	for (let i = 0; i < 40; i++) {
		const mid = (elo + ehi) / 2;
		const s = synthSpectrum(F, { ...BASE, exponent: mid }, [BASE_PEAK]);
		// Flatter background means MORE power at 8 to 12 Hz here, so the
		// comparison runs the other way round.
		if (bandPower(F, s, ...BAND) > target) elo = mid;
		else ehi = mid;
	}
	return { pw, exponent: (elo + ehi) / 2 };
}

function Panel({
	title,
	subtitle,
	spectrum,
	exponent,
	peakPw,
	accent,
}: {
	title: string;
	subtitle: string;
	spectrum: number[];
	exponent: number;
	peakPw: number;
	accent: string;
}) {
	const lo = Math.min(...spectrum) - 0.1;
	const hi = 2.3;
	const y = (v: number) => px(H - 26 - ((v - lo) / (hi - lo || 1)) * (H - 44));
	const bg = F.map((f) => aperiodicAt(f, { offset: BASE.offset, exponent }));

	let d = "";
	let dbg = "";
	for (let i = 0; i < F.length; i++) {
		d += `${i === 0 ? "M" : "L"}${xOf(F[i])} ${y(spectrum[i])}`;
		dbg += `${i === 0 ? "M" : "L"}${xOf(F[i])} ${y(bg[i])}`;
	}

	return (
		<div>
			<p className="font-sans text-[10px] uppercase tracking-[0.16em]" style={{ color: accent }}>
				{title}
			</p>
			<p className="mt-0.5 font-sans text-[10px] leading-tight text-muted">{subtitle}</p>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className="mt-2 w-full"
				role="img"
				aria-label={`${title}. Background exponent ${exponent.toFixed(2)}, peak height ${peakPw.toFixed(2)}.`}
			>
				{/* the band under discussion */}
				<rect
					x={xOf(BAND[0])}
					y={12}
					width={xOf(BAND[1]) - xOf(BAND[0])}
					height={H - 38}
					fill="currentColor"
					className="text-foreground"
					opacity={0.06}
				/>
				<line x1={X0} y1={H - 26} x2={W - 8} y2={H - 26} stroke="currentColor" className="text-rule" strokeWidth={1} />
				<path d={dbg} fill="none" stroke={SERIES_COLOR.body} strokeWidth={1.6} strokeDasharray="5 4" />
				<path d={d} fill="none" stroke={accent} strokeWidth={2} />
				{[1, 10, 50].map((t) => (
					<text key={t} x={xOf(t)} y={H - 12} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 9 }}>
						{t}
					</text>
				))}
				<text
					x={(xOf(BAND[0]) + xOf(BAND[1])) / 2}
					y={H - 30}
					textAnchor="middle"
					className="fill-muted font-sans"
					style={{ fontSize: 8 }}
				>
					8 to 12 Hz
				</text>
			</svg>
		</div>
	);
}

export function SameBandPower() {
	const [rise, setRise] = useState(1.4);

	const { left, right, solved, baseline, target, fitL, fitR } = useMemo(() => {
		const base = synthSpectrum(F, BASE, [BASE_PEAK]);
		const baseline = bandPower(F, base, ...BAND);
		const target = baseline * rise;
		const solved = solveForBandPower(target);
		const left = synthSpectrum(F, BASE, [{ ...BASE_PEAK, pw: solved.pw }]);
		const right = synthSpectrum(F, { ...BASE, exponent: solved.exponent }, [BASE_PEAK]);
		return {
			left,
			right,
			solved,
			baseline,
			target,
			fitL: fitSpectrum(F, left),
			fitR: fitSpectrum(F, right),
		};
	}, [rise]);

	const bpL = bandPower(F, left, ...BAND);
	const bpR = bandPower(F, right, ...BAND);
	const agree = Math.abs(bpL - bpR) / Math.max(bpL, bpR) < 0.02;

	return (
		<Figure
			label="Same alpha power, two different brains"
			controls={
				<Slider
					label="Alpha power"
					value={rise}
					min={1}
					max={2.2}
					step={0.02}
					onChange={setRise}
					format={(v) => `${((v - 1) * 100).toFixed(0)}% up`}
				/>
			}
			caption={
				<>
					Both panels are built to carry exactly the same power between 8 and 12 Hz,
					and the control raises that power in both at once. On the left the rhythm
					genuinely got stronger. On the right the rhythm did not change at all and the
					background tilted underneath it. A band-power measurement returns the same
					number for both, and the two describe different things happening in a head:
					one is an oscillation, the other is a shift in the aperiodic activity that
					has been linked to excitation and inhibition balance, arousal and age.
				</>
			}
		>
			<div className="grid gap-6 sm:grid-cols-2">
				<Panel
					title="A · the rhythm grew"
					subtitle="Background held still, peak raised."
					spectrum={left}
					exponent={BASE.exponent}
					peakPw={solved.pw}
					accent={SERIES_COLOR.world}
				/>
				<Panel
					title="B · the background tilted"
					subtitle="Peak held still, background flattened."
					spectrum={right}
					exponent={solved.exponent}
					peakPw={BASE_PEAK.pw}
					accent={SERIES_COLOR.result}
				/>
			</div>

			<div className="mt-5 overflow-x-auto border-t border-rule pt-4">
				<table className="w-full min-w-[440px] border-collapse text-left">
					<thead>
						<tr>
							<th className="pb-2 font-sans text-[10px] uppercase tracking-[0.16em] font-normal text-muted">
								Measure
							</th>
							<th className="pb-2 font-sans text-[10px] uppercase tracking-[0.16em] font-normal" style={{ color: SERIES_COLOR.world }}>
								A · rhythm grew
							</th>
							<th className="pb-2 font-sans text-[10px] uppercase tracking-[0.16em] font-normal" style={{ color: SERIES_COLOR.result }}>
								B · background tilted
							</th>
							<th className="pb-2 font-sans text-[10px] uppercase tracking-[0.16em] font-normal text-muted">
								Tells them apart?
							</th>
						</tr>
					</thead>
					<tbody className="font-sans text-[13px] tabular-nums">
						<tr className="border-t border-rule">
							<td className="py-2 text-muted">Alpha band power</td>
							<td className="py-2 text-foreground">{bpL.toFixed(1)}</td>
							<td className="py-2 text-foreground">{bpR.toFixed(1)}</td>
							<td className="py-2 text-muted">{agree ? "no" : "not quite matched"}</td>
						</tr>
						<tr className="border-t border-rule">
							<td className="py-2 text-muted">Aperiodic exponent</td>
							<td className="py-2 text-foreground">{fitL.aperiodic.exponent.toFixed(2)}</td>
							<td className="py-2 text-foreground">{fitR.aperiodic.exponent.toFixed(2)}</td>
							<td className="py-2" style={{ color: SERIES_COLOR.body }}>yes</td>
						</tr>
						<tr className="border-t border-rule">
							<td className="py-2 text-muted">Peak height above background</td>
							<td className="py-2 text-foreground">{(fitL.peaks[0]?.pw ?? 0).toFixed(2)}</td>
							<td className="py-2 text-foreground">{(fitR.peaks[0]?.pw ?? 0).toFixed(2)}</td>
							<td className="py-2" style={{ color: SERIES_COLOR.body }}>yes</td>
						</tr>
					</tbody>
				</table>
				<p className="mt-3 font-sans text-[11px] leading-relaxed text-muted">
					Baseline band power {baseline.toFixed(1)}, both panels raised to{" "}
					{target.toFixed(1)} by searching for the peak height and the background slope
					that each land on that number.
				</p>
			</div>
		</Figure>
	);
}
