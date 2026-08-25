"use client";

import { useMemo, useState } from "react";
import { Figure, Legend, Slider, Readout, Baseline, SERIES_COLOR } from "./_ui";
import { coloredNoise, crossCorrelation, toPath, pearson, mulberry32, gaussian, zscore, px } from "./_signals";

const N = 512;
const FS = 64; // samples per second — 8 s of signal
const MAX_LAG = 64; // ±1 s
const W = 720;
const H_SIG = 110;
const H_XC = 130;

export function LaggedCrossCorrelation() {
	const [lagMs, setLagMs] = useState(300);
	const [noise, setNoise] = useState(0.5);

	const { world, body, xc, r0 } = useMemo(() => {
		const base = coloredNoise(N + MAX_LAG * 2, 1.6, 11);
		const shift = Math.round((lagMs / 1000) * FS);
		const rand = mulberry32(23);

		const w: number[] = [];
		const b: number[] = [];
		for (let i = 0; i < N; i++) {
			const src = i + MAX_LAG;
			w.push(base[src]);
			b.push(base[src - shift] + gaussian(rand) * noise);
		}
		const wz = zscore(w);
		const bz = zscore(b);
		return {
			world: wz,
			body: bz,
			xc: crossCorrelation(wz, bz, MAX_LAG),
			r0: pearson(wz, bz),
		};
	}, [lagMs, noise]);

	const peakX = px(((xc.peakLag + MAX_LAG) / (MAX_LAG * 2)) * W);
	const zeroX = W / 2;

	return (
		<Figure
			label="Linear family · lagged cross-correlation"
			controls={
				<>
					<Slider
						label="True delay"
						value={lagMs}
						min={-800}
						max={800}
						step={10}
						onChange={setLagMs}
						format={(v) => `${v} ms`}
					/>
					<Slider
						label="Noise"
						value={noise}
						min={0}
						max={2}
						step={0.05}
						onChange={setNoise}
						format={(v) => v.toFixed(2)}
					/>
					<Legend
						items={[
							{ key: "world", label: "Environment" },
							{ key: "body", label: "Body — the same signal, delayed and noised" },
							{ key: "result", label: "Correlation at each lag" },
						]}
					/>
				</>
			}
			caption={
				<>
					Correlating two traces where they happen to sit answers the wrong question,
					because effects take time to arrive. Sweeping the lag and taking the peak is
					what a windowed cross-correlation reports — one peak and one lag per window,
					so that both can drift as conditions change. Notice that the recovered delay
					stays right even as noise buries the correlation: the lag survives long
					after the strength has gone.
				</>
			}
		>
			<svg
				viewBox={`0 0 ${W} ${H_SIG}`}
				className="w-full"
				role="img"
				aria-label={`Two signals, the second delayed by ${lagMs} milliseconds relative to the first.`}
			>
				<Baseline width={W} y={H_SIG / 2} />
				<path d={toPath(world, W, H_SIG, -3, 3)} fill="none" stroke={SERIES_COLOR.world} strokeWidth={2} />
				<path d={toPath(body, W, H_SIG, -3, 3)} fill="none" stroke={SERIES_COLOR.body} strokeWidth={2} />
			</svg>

			<svg
				viewBox={`0 0 ${W} ${H_XC}`}
				className="mt-2 w-full"
				role="img"
				aria-label={`Correlation as a function of lag, peaking at ${Math.round((xc.peakLag / FS) * 1000)} milliseconds with r of ${xc.peakR.toFixed(2)}.`}
			>
				<Baseline width={W} y={H_XC / 2} />
				{/* zero-lag reference */}
				<line
					x1={zeroX}
					y1={0}
					x2={zeroX}
					y2={H_XC}
					stroke="currentColor"
					strokeWidth={1}
					strokeDasharray="2 3"
					className="text-rule"
				/>
				<path d={toPath(xc.r, W, H_XC, -1, 1)} fill="none" stroke={SERIES_COLOR.result} strokeWidth={2} />
				{/* peak marker — direct label rather than colour alone */}
				<line
					x1={peakX}
					y1={0}
					x2={peakX}
					y2={H_XC}
					stroke={SERIES_COLOR.result}
					strokeWidth={1}
					opacity={0.5}
				/>
				<circle
					cx={peakX}
					cy={px(2 + (H_XC - 4) * (1 - (xc.peakR + 1) / 2))}
					r={4}
					fill={SERIES_COLOR.result}
					stroke="var(--background)"
					strokeWidth={2}
				/>
				<text
					x={Math.min(W - 4, Math.max(4, peakX + 8))}
					y={16}
					className="fill-muted font-sans"
					style={{ fontSize: 10 }}
				>
					peak
				</text>
				<text x={zeroX + 5} y={H_XC - 5} className="fill-muted font-sans" style={{ fontSize: 10 }}>
					lag 0
				</text>
			</svg>

			<div className="mt-4">
				<Readout
					items={[
						{ label: "Peak r", value: xc.peakR.toFixed(3), series: "result" },
						{
							label: "at lag",
							value: `${Math.round((xc.peakLag / FS) * 1000)} ms`,
							series: "result",
						},
						{ label: "r at zero lag", value: r0.toFixed(3), muted: true },
					]}
				/>
			</div>
		</Figure>
	);
}
