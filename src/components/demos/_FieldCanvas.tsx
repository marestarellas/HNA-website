"use client";

import { useEffect, useRef } from "react";

/**
 * Draws a square scalar field to a canvas.
 *
 * Canvas rather than SVG because these are images: a 64 x 64 field is 4096
 * values, and asking the DOM to hold that many rects per figure would be
 * absurd. The trade is that CSS custom properties are not available to the
 * drawing code, so the ramp endpoints are resolved once from the computed
 * style and re-resolved when the colour scheme changes.
 *
 * Two ramps, chosen by what the numbers mean:
 *   diverging  values signed around zero, a wave crest and a trough. Two hues
 *              meeting at the page background, so zero reads as "nothing here"
 *              rather than as a colour.
 *   mono       values with no meaningful zero, a texture or a mode magnitude.
 *              One hue, light to dark.
 */

type Ramp = "diverging" | "mono";

function readVar(el: HTMLElement, name: string, fallback: string): string {
	const v = getComputedStyle(el).getPropertyValue(name).trim();
	return v || fallback;
}

function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace("#", "").trim();
	const full =
		h.length === 3
			? h
					.split("")
					.map((c) => c + c)
					.join("")
			: h;
	const n = parseInt(full, 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function FieldCanvas({
	field,
	N,
	ramp = "diverging",
	height = 168,
	label,
	className = "",
	/** Optional column to mark, for the timestack figure. */
	markColumn,
}: {
	field: Float64Array;
	N: number;
	ramp?: Ramp;
	height?: number;
	label: string;
	className?: string;
	markColumn?: number;
}) {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const paint = () => {
			const bg = hexToRgb(readVar(canvas, "--background", "#f6f4ef"));
			const a = hexToRgb(
				ramp === "diverging"
					? readVar(canvas, "--viz-world", "#BE6410")
					: readVar(canvas, "--background", "#f6f4ef")
			);
			const b = hexToRgb(
				ramp === "diverging"
					? readVar(canvas, "--viz-body", "#1E6FA8")
					: readVar(canvas, "--viz-result", "#A33A6E")
			);

			// Robust range, so one outlier pixel does not flatten everything else.
			const sorted = Float64Array.from(field).sort();
			const lo = sorted[Math.floor(sorted.length * 0.02)];
			const hi = sorted[Math.floor(sorted.length * 0.98)];
			const span = hi - lo || 1;

			canvas.width = N;
			canvas.height = N;
			const img = ctx.createImageData(N, N);

			for (let i = 0; i < N * N; i++) {
				let r: number;
				let g: number;
				let bl: number;
				if (ramp === "diverging") {
					// -1..1 around the midpoint; negative toward a, positive toward b.
					const t = Math.max(-1, Math.min(1, ((field[i] - lo) / span) * 2 - 1));
					const w = Math.abs(t);
					const end = t < 0 ? a : b;
					r = bg[0] + (end[0] - bg[0]) * w;
					g = bg[1] + (end[1] - bg[1]) * w;
					bl = bg[2] + (end[2] - bg[2]) * w;
				} else {
					const t = Math.max(0, Math.min(1, (field[i] - lo) / span));
					r = a[0] + (b[0] - a[0]) * t;
					g = a[1] + (b[1] - a[1]) * t;
					bl = a[2] + (b[2] - a[2]) * t;
				}
				const p = i * 4;
				img.data[p] = r;
				img.data[p + 1] = g;
				img.data[p + 2] = bl;
				img.data[p + 3] = 255;
			}
			ctx.putImageData(img, 0, 0);
		};

		paint();
		const scheme = window.matchMedia("(prefers-color-scheme: dark)");
		scheme.addEventListener("change", paint);
		return () => scheme.removeEventListener("change", paint);
	}, [field, N, ramp]);

	return (
		<div className={`relative ${className}`} style={{ height }}>
			<canvas
				ref={ref}
				role="img"
				aria-label={label}
				className="h-full w-full rounded-sm"
				style={{ imageRendering: "pixelated", objectFit: "cover" }}
			/>
			{markColumn !== undefined && (
				<div
					aria-hidden
					className="pointer-events-none absolute inset-y-0"
					style={{
						left: `${((markColumn + 0.5) / N) * 100}%`,
						width: 2,
						background: "var(--viz-result)",
						transform: "translateX(-1px)",
					}}
				/>
			)}
		</div>
	);
}
