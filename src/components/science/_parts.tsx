"use client";

/**
 * Small shared controls for the pilot figures.
 *
 * Declared at module scope rather than inside a component on purpose. A
 * component defined during render is a new component type on every render, so
 * React unmounts and remounts the DOM beneath it, and buttons built that way
 * look dead to a reader holding the pointer down.
 */

export function Pills<T extends string>({
	items,
	value,
	onPick,
	label,
}: {
	items: { id: T; label: string }[];
	value: T;
	onPick: (v: T) => void;
	label: string;
}) {
	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
			<span className="w-24 shrink-0 font-sans text-[10px] uppercase tracking-[0.16em] text-muted">
				{label}
			</span>
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
		</div>
	);
}

/** Every subject drawn, every time. With five of them there is no honest way to
 *  show a summary without showing what it summarises. */
export const SUBJECT_MARK = ["2", "3", "4", "5", "6"];

export function mean(xs: number[]): number {
	return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : NaN;
}
