"use client";

import type { ReactNode } from "react";

/**
 * Shared chrome for the Learn demos, so every figure carries a legend, a
 * caption and its controls in the same place. A reader who works out how to
 * read the first figure should not have to work out the second.
 */

export type SeriesKey = "world" | "body" | "result" | "null";

export const SERIES_COLOR: Record<SeriesKey, string> = {
	world: "var(--viz-world)",
	body: "var(--viz-body)",
	result: "var(--viz-result)",
	null: "var(--viz-null)",
};

export function Figure({
	label,
	children,
	controls,
	caption,
}: {
	label: string;
	children: ReactNode;
	controls?: ReactNode;
	caption?: ReactNode;
}) {
	return (
		<figure className="my-10">
			<div className="rounded-sm border border-rule bg-background p-4 sm:p-5">
				<p className="mb-3 font-sans text-[10px] uppercase tracking-[0.22em] text-muted">
					{label}
				</p>
				{children}
				{controls && <div className="mt-4 space-y-3 border-t border-rule pt-4">{controls}</div>}
			</div>
			{caption && (
				<figcaption className="mt-3 font-sans text-xs leading-relaxed text-muted">
					{caption}
				</figcaption>
			)}
		</figure>
	);
}

/** Legend. Always rendered when a figure shows more than one series, because identity
 *  must never rest on colour alone. */
export function Legend({
	items,
}: {
	items: { key: SeriesKey; label: string; dashed?: boolean }[];
}) {
	return (
		<ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
			{items.map((it) => (
				<li key={it.label} className="flex items-center gap-2">
					<span
						aria-hidden
						className="block h-0.5 w-5 shrink-0"
						style={
							it.dashed
								? {
										backgroundImage: `repeating-linear-gradient(to right, ${SERIES_COLOR[it.key]} 0 4px, transparent 4px 7px)`,
									}
								: { background: SERIES_COLOR[it.key] }
						}
					/>
					<span className="font-sans text-[11px] tracking-wide text-muted">{it.label}</span>
				</li>
			))}
		</ul>
	);
}

export function Slider({
	label,
	value,
	min,
	max,
	step,
	onChange,
	format,
	hint,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	onChange: (v: number) => void;
	format?: (v: number) => string;
	hint?: string;
}) {
	const id = `slider-${label.replace(/\s+/g, "-").toLowerCase()}`;
	return (
		<div className="flex items-center gap-3">
			<label
				htmlFor={id}
				className="w-32 shrink-0 font-sans text-[10px] uppercase tracking-[0.16em] text-muted"
			>
				{label}
			</label>
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(parseFloat(e.target.value))}
				className="h-1 flex-1 accent-foreground"
			/>
			<span className="w-16 shrink-0 text-right font-sans text-xs tabular-nums text-foreground">
				{format ? format(value) : value.toFixed(2)}
			</span>
			{hint && <span className="hidden font-sans text-[10px] text-muted sm:inline">{hint}</span>}
		</div>
	);
}

/** A single computed number, shown large. The point of most of these demos is
 *  to connect a picture to a value, so the value gets real typographic weight. */
export function Readout({
	items,
}: {
	items: { label: string; value: string; series?: SeriesKey; muted?: boolean }[];
}) {
	return (
		<div className="flex flex-wrap gap-x-8 gap-y-3">
			{items.map((it) => (
				<div key={it.label}>
					<div className="flex items-center gap-1.5">
						{it.series && (
							<span
								aria-hidden
								className="block h-2 w-2 rounded-full"
								style={{ background: SERIES_COLOR[it.series] }}
							/>
						)}
						<span className="font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
							{it.label}
						</span>
					</div>
					<div
						className={`mt-0.5 font-sans text-xl tabular-nums ${it.muted ? "text-muted" : "text-foreground"}`}
					>
						{it.value}
					</div>
				</div>
			))}
		</div>
	);
}

/** Recessive baseline for signal plots. */
export function Baseline({ width, y }: { width: number; y: number }) {
	return (
		<line
			x1={0}
			y1={y}
			x2={width}
			y2={y}
			stroke="currentColor"
			strokeWidth={1}
			className="text-rule"
		/>
	);
}
