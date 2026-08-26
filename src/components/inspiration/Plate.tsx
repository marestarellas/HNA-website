import type { ReactNode } from "react";

/**
 * One pinned thing on the board.
 *
 * The rotations are deterministic, derived from the plate's own index rather
 * than drawn at random, for two reasons: a random tilt would differ between
 * server and client and break hydration, and a page that reshuffles itself on
 * every visit stops feeling like a notebook someone actually kept.
 *
 * Kept deliberately shy of scrapbook kitsch. A slight tilt, a soft shadow and a
 * hand-written-looking marginal note is enough to say "collected"; torn paper
 * edges and pushpin graphics would say "template".
 */

const TILTS = [-1.4, 0.9, -0.6, 1.5, -1.1, 0.5, -1.8, 1.1, -0.4, 1.3];

export function Plate({
	src,
	alt,
	note,
	index = 0,
	wide = false,
}: {
	src: string;
	alt: string;
	note?: ReactNode;
	index?: number;
	wide?: boolean;
}) {
	const tilt = TILTS[index % TILTS.length];
	return (
		<figure
			className={`group ${wide ? "sm:col-span-2" : ""}`}
			style={{ transform: `rotate(${tilt}deg)` }}
		>
			<div className="overflow-hidden rounded-[2px] bg-foreground/[0.04] p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.10)] transition-transform duration-300 group-hover:scale-[1.015]">
				<img src={src} alt={alt} loading="lazy" className="block w-full rounded-[1px]" />
			</div>
			{note && (
				<figcaption className="mt-2 px-1 font-sans text-[11px] leading-relaxed text-muted">
					{note}
				</figcaption>
			)}
		</figure>
	);
}

/** A quotation given room to breathe. */
export function Quote({
	children,
	attribution,
	large = false,
}: {
	children: ReactNode;
	attribution?: string;
	large?: boolean;
}) {
	return (
		<blockquote className="my-8">
			<p
				className={`font-serif italic leading-relaxed text-foreground ${
					large ? "text-2xl md:text-[1.75rem]" : "text-lg md:text-xl"
				}`}
			>
				{children}
			</p>
			{attribution && (
				<footer className="mt-3 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
					{attribution}
				</footer>
			)}
		</blockquote>
	);
}

/** A section of the board. Each trail is one thread someone followed. */
export function Trail({
	n,
	title,
	lead,
	children,
}: {
	n: number;
	title: string;
	lead?: ReactNode;
	children: ReactNode;
}) {
	return (
		<section className="mt-24 first:mt-0">
			<header className="mb-8 flex items-baseline gap-4 border-t border-rule pt-5">
				<span
					aria-hidden
					className="select-none font-serif text-2xl leading-none tabular-nums text-rule"
				>
					{String(n).padStart(2, "0")}
				</span>
				<h2 className="font-serif text-xl leading-snug text-foreground md:text-2xl">
					{title}
				</h2>
			</header>
			{lead && (
				<p className="mb-8 max-w-2xl font-serif text-lg leading-relaxed text-foreground/85">
					{lead}
				</p>
			)}
			{children}
		</section>
	);
}
