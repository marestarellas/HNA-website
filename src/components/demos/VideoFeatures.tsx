"use client";

import { useEffect, useRef, useState } from "react";
import { Figure, Readout, SERIES_COLOR } from "./_ui";

/**
 * Real footage, with the derived views computed live from its pixels.
 *
 * The showcase renders these offline into separate clips. Doing it in the
 * browser instead costs a little accuracy and buys something better for
 * teaching: the reader picks the clip and the view, and watches the trace build
 * underneath as the video plays. Nothing is pre-baked, so nothing can quietly
 * be a nicer answer than the method actually gives.
 *
 * Frames are sampled onto a small canvas and read back with getImageData. That
 * only works because the files are served from our own origin; a cross-origin
 * video taints the canvas and the read throws.
 *
 * Never autoplays. The reader presses play.
 */

const SW = 128; // sampling grid, wide
const SH = 72; //  and high
const TRACE_LEN = 260;
const TILES_X = 8;
const TILES_Y = 5;

type Clip = { id: string; label: string; note: string };
const CLIPS: Clip[] = [
	{
		id: "waves",
		label: "Breaking swell",
		note: "Long crests arriving steadily, with foam. Strong low-frequency structure.",
	},
	{
		id: "rapid_waves",
		label: "Choppy water",
		note: "Shorter, faster, less organised. The same measures give quite different numbers.",
	},
	{
		id: "generated_waves",
		label: "Synthesised",
		note: "Generated rather than filmed, and much more regular than any real sea.",
	},
];

type View = "source" | "diff" | "patches" | "timestack";
const VIEWS: { id: View; label: string }[] = [
	{ id: "source", label: "Source" },
	{ id: "diff", label: "Frame difference" },
	{ id: "patches", label: "Patch activity" },
	{ id: "timestack", label: "Timestack" },
];

const VIEW_NOTE: Record<View, string> = {
	source: "The clip as filmed, sampled down to the grid every measure below works on.",
	diff: "How much each pixel changed since the last frame. Breaking crests light up; flat water goes dark. This is the raw-family motion measure.",
	patches:
		"The frame tiled into a grid, each tile carrying its own activity. Between the whole image and the single pixel, and where most practical work sits.",
	timestack:
		"One column of the frame, stacked over time. Space runs down, time runs right. Waves passing the column become diagonal stripes, and their spacing is the wave period.",
};

export function VideoFeatures() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const sampleRef = useRef<HTMLCanvasElement>(null);
	const viewRef = useRef<HTMLCanvasElement>(null);
	const traceRef = useRef<HTMLCanvasElement>(null);

	const [clip, setClip] = useState<Clip["id"]>("waves");
	const [view, setView] = useState<View>("source");
	const [playing, setPlaying] = useState(false);
	const [stats, setStats] = useState({ brightness: 0, motion: 0, frames: 0 });

	const viewModeRef = useRef<View>(view);
	useEffect(() => {
		viewModeRef.current = view;
	}, [view]);

	// Reset accumulated state when the clip changes: a timestack built from two
	// different seas would be a lie.
	const resetKey = clip;

	useEffect(() => {
		const video = videoRef.current;
		const sample = sampleRef.current;
		const out = viewRef.current;
		const traceCanvas = traceRef.current;
		if (!video || !sample || !out || !traceCanvas) return;

		const sctx = sample.getContext("2d", { willReadFrequently: true });
		const octx = out.getContext("2d");
		const tctx = traceCanvas.getContext("2d");
		if (!sctx || !octx || !tctx) return;

		sample.width = SW;
		sample.height = SH;

		let prev: Float32Array | null = null;
		const brightnessTrace: number[] = [];
		const motionTrace: number[] = [];
		const stackCols: Float32Array[] = [];
		let raf = 0;
		let frames = 0;

		const colours = () => {
			const cs = getComputedStyle(out);
			return {
				bg: cs.getPropertyValue("--background").trim() || "#f6f4ef",
				world: cs.getPropertyValue("--viz-world").trim() || "#BE6410",
				result: cs.getPropertyValue("--viz-result").trim() || "#A33A6E",
				rule: cs.getPropertyValue("--rule").trim() || "#d8d4cc",
			};
		};

		const hex = (h: string): [number, number, number] => {
			const s = h.replace("#", "");
			const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
			const n = parseInt(f, 16);
			return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
		};

		const step = () => {
			if (video.readyState >= 2 && !video.paused && !video.ended) {
				sctx.drawImage(video, 0, 0, SW, SH);
				const data = sctx.getImageData(0, 0, SW, SH).data;

				// Luminance grid.
				const lum = new Float32Array(SW * SH);
				let bsum = 0;
				for (let i = 0; i < SW * SH; i++) {
					const p = i * 4;
					const v = (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
					lum[i] = v;
					bsum += v;
				}
				const brightness = bsum / (SW * SH);

				// Frame difference.
				let msum = 0;
				const diff = new Float32Array(SW * SH);
				if (prev) {
					for (let i = 0; i < lum.length; i++) {
						const d = Math.abs(lum[i] - prev[i]);
						diff[i] = d;
						msum += d;
					}
				}
				const motion = prev ? msum / lum.length : 0;
				prev = lum;

				brightnessTrace.push(brightness);
				motionTrace.push(motion);
				if (brightnessTrace.length > TRACE_LEN) brightnessTrace.shift();
				if (motionTrace.length > TRACE_LEN) motionTrace.shift();

				// Timestack column (centre).
				const col = new Float32Array(SH);
				const cx = Math.floor(SW / 2);
				for (let y = 0; y < SH; y++) col[y] = lum[y * SW + cx];
				stackCols.push(col);
				if (stackCols.length > TRACE_LEN) stackCols.shift();

				frames++;
				if (frames % 6 === 0) {
					setStats({ brightness, motion, frames });
				}

				// ---- draw the selected view -------------------------------------
				const mode = viewModeRef.current;
				out.width = SW;
				out.height = SH;
				const img = octx.createImageData(SW, SH);
				const C = colours();
				const bgc = hex(C.bg);
				const wc = hex(C.world);

				if (mode === "source") {
					for (let i = 0; i < SW * SH; i++) {
						const p = i * 4;
						img.data[p] = data[p];
						img.data[p + 1] = data[p + 1];
						img.data[p + 2] = data[p + 2];
						img.data[p + 3] = 255;
					}
				} else if (mode === "diff") {
					let mx = 0;
					for (const d of diff) if (d > mx) mx = d;
					mx = mx || 1;
					for (let i = 0; i < SW * SH; i++) {
						const t = Math.min(1, (diff[i] / mx) * 1.6);
						const p = i * 4;
						img.data[p] = bgc[0] + (wc[0] - bgc[0]) * t;
						img.data[p + 1] = bgc[1] + (wc[1] - bgc[1]) * t;
						img.data[p + 2] = bgc[2] + (wc[2] - bgc[2]) * t;
						img.data[p + 3] = 255;
					}
				} else if (mode === "patches") {
					const tw = Math.floor(SW / TILES_X);
					const th = Math.floor(SH / TILES_Y);
					const tile = new Float32Array(TILES_X * TILES_Y);
					for (let ty = 0; ty < TILES_Y; ty++) {
						for (let tx = 0; tx < TILES_X; tx++) {
							let s = 0;
							let n = 0;
							for (let y = ty * th; y < (ty + 1) * th; y++) {
								for (let x = tx * tw; x < (tx + 1) * tw; x++) {
									s += diff[y * SW + x];
									n++;
								}
							}
							tile[ty * TILES_X + tx] = n ? s / n : 0;
						}
					}
					let mx = 0;
					for (const v of tile) if (v > mx) mx = v;
					mx = mx || 1;
					for (let y = 0; y < SH; y++) {
						const ty = Math.min(TILES_Y - 1, Math.floor(y / th));
						for (let x = 0; x < SW; x++) {
							const tx = Math.min(TILES_X - 1, Math.floor(x / tw));
							const t = Math.min(1, tile[ty * TILES_X + tx] / mx);
							const p = (y * SW + x) * 4;
							// Keep a hairline between tiles so the grid is legible.
							const edge = y % th === 0 || x % tw === 0;
							const k = edge ? 0.25 : t;
							img.data[p] = bgc[0] + (wc[0] - bgc[0]) * k;
							img.data[p + 1] = bgc[1] + (wc[1] - bgc[1]) * k;
							img.data[p + 2] = bgc[2] + (wc[2] - bgc[2]) * k;
							img.data[p + 3] = 255;
						}
					}
				} else {
					// timestack: space down, time across
					out.width = TRACE_LEN;
					out.height = SH;
					const ts = octx.createImageData(TRACE_LEN, SH);
					for (let t = 0; t < TRACE_LEN; t++) {
						const c = stackCols[t];
						for (let y = 0; y < SH; y++) {
							const v = c ? c[y] : 1;
							const p = (y * TRACE_LEN + t) * 4;
							const g = 246 - 200 * (1 - v);
							ts.data[p] = g;
							ts.data[p + 1] = g - 6;
							ts.data[p + 2] = g - 14;
							ts.data[p + 3] = c ? 255 : 0;
						}
					}
					octx.putImageData(ts, 0, 0);
				}
				if (mode !== "timestack") octx.putImageData(img, 0, 0);

				// ---- draw the traces --------------------------------------------
				const TW = 640;
				const TH = 90;
				traceCanvas.width = TW;
				traceCanvas.height = TH;
				tctx.clearRect(0, 0, TW, TH);
				const line = (arr: number[], colour: string) => {
					if (arr.length < 2) return;
					const lo = Math.min(...arr);
					const hi = Math.max(...arr);
					const span = hi - lo || 1;
					tctx.strokeStyle = colour;
					tctx.lineWidth = 2;
					tctx.beginPath();
					for (let i = 0; i < arr.length; i++) {
						const x = (i / (TRACE_LEN - 1)) * TW;
						const y = TH - 6 - ((arr[i] - lo) / span) * (TH - 12);
						if (i === 0) tctx.moveTo(x, y);
						else tctx.lineTo(x, y);
					}
					tctx.stroke();
				};
				line(brightnessTrace, C.world);
				line(motionTrace, C.result);
			}
			raf = requestAnimationFrame(step);
		};

		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [resetKey]);

	// Drive the label from the element's own events rather than from what we just
	// asked it to do. `play()` returns a promise that can reject (autoplay
	// policy, a hidden tab, a decode failure), and an optimistic setState leaves
	// the button reading "Pause" over a video that never started.
	useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		v.addEventListener("play", onPlay);
		v.addEventListener("pause", onPause);
		v.addEventListener("ended", onPause);
		return () => {
			v.removeEventListener("play", onPlay);
			v.removeEventListener("pause", onPause);
			v.removeEventListener("ended", onPause);
		};
	}, [resetKey]);

	const [blocked, setBlocked] = useState(false);

	const toggle = () => {
		const v = videoRef.current;
		if (!v) return;
		if (v.paused) {
			setBlocked(false);
			v.play().catch(() => setBlocked(true));
		} else {
			v.pause();
		}
	};

	const active = CLIPS.find((c) => c.id === clip)!;

	return (
		<Figure
			label="Real footage · every measure computed live from the pixels"
			controls={
				<>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
						<span className="w-16 shrink-0 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
							Clip
						</span>
						<div className="flex flex-wrap gap-2">
							{CLIPS.map((c) => (
								<button
									key={c.id}
									type="button"
									onClick={() => setClip(c.id)}
									aria-pressed={clip === c.id}
									className={[
										"rounded-full border px-3 py-1 font-sans text-[11px] transition-colors",
										clip === c.id
											? "border-foreground bg-foreground text-background"
											: "border-rule text-muted hover:text-foreground",
									].join(" ")}
								>
									{c.label}
								</button>
							))}
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
						<span className="w-16 shrink-0 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
							View
						</span>
						<div className="flex flex-wrap gap-2">
							{VIEWS.map((v) => (
								<button
									key={v.id}
									type="button"
									onClick={() => setView(v.id)}
									aria-pressed={view === v.id}
									className={[
										"rounded-full border px-3 py-1 font-sans text-[11px] transition-colors",
										view === v.id
											? "border-foreground bg-foreground text-background"
											: "border-rule text-muted hover:text-foreground",
									].join(" ")}
								>
									{v.label}
								</button>
							))}
						</div>
					</div>
					<button
						type="button"
						onClick={toggle}
						className="rounded-full border border-foreground px-4 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-background"
					>
						{playing ? "Pause" : "Play"}
					</button>
				</>
			}
			caption={
				<>
					{VIEW_NOTE[view]} {active.note} Nothing here is pre-rendered: the frames are
					drawn to a small canvas, read back, and reduced in the browser as the clip
					plays, which is why the traces only advance while it is running.
				</>
			}
		>
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="sm:w-[220px] sm:shrink-0">
					<p className="mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						{VIEWS.find((v) => v.id === view)!.label}
					</p>
					<canvas
						ref={viewRef}
						className="w-full rounded-sm bg-foreground/[0.04]"
						style={{ aspectRatio: view === "timestack" ? "16 / 7" : "16 / 9" }}
						role="img"
						aria-label={`${VIEWS.find((v) => v.id === view)!.label} view of the ${active.label} clip.`}
					/>
					{!playing && !blocked && (
						<p className="mt-2 font-sans text-[10px] leading-tight text-muted">
							Press play. Nothing is computed until the clip runs.
						</p>
					)}
					{blocked && (
						<p className="mt-2 font-sans text-[10px] leading-tight text-muted">
							The browser would not start playback from that click. Use the controls on
							the clip below instead.
						</p>
					)}
				</div>

				<div className="min-w-0 flex-1">
					<p className="mb-1 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
						Traces, building as it plays
					</p>
					<canvas
						ref={traceRef}
						className="w-full"
						style={{ height: 90 }}
						role="img"
						aria-label="Brightness and motion traces extracted from the clip."
					/>
					<div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
						<span className="flex items-center gap-2">
							<span
								aria-hidden
								className="block h-0.5 w-5"
								style={{ background: SERIES_COLOR.world }}
							/>
							<span className="font-sans text-[11px] text-muted">Mean brightness</span>
						</span>
						<span className="flex items-center gap-2">
							<span
								aria-hidden
								className="block h-0.5 w-5"
								style={{ background: SERIES_COLOR.result }}
							/>
							<span className="font-sans text-[11px] text-muted">Motion energy</span>
						</span>
					</div>
					<div className="mt-4">
						<Readout
							items={[
								{ label: "Brightness", value: stats.brightness.toFixed(3), series: "world" },
								{ label: "Motion", value: stats.motion.toFixed(4), series: "result" },
								{ label: "Frames read", value: String(stats.frames), muted: true },
							]}
						/>
					</div>
				</div>
			</div>

			{/* The source video. Shown small rather than hidden, so it is obvious the
			    numbers come from something real. */}
			<div className="mt-4 border-t border-rule pt-4">
				<video
					key={clip}
					ref={videoRef}
					src={`/learn/video/${clip}.mp4`}
					loop
					muted
					playsInline
					controls
					preload="metadata"
					className="w-full rounded-sm sm:max-w-[380px]"
				/>
			</div>

			<canvas ref={sampleRef} className="hidden" aria-hidden />
		</Figure>
	);
}
