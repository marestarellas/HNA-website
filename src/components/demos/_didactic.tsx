"use client";

import type { ReactNode } from "react";
import { SERIES_COLOR } from "./_ui";

/**
 * Teaching furniture for the Learn page.
 *
 * The page needs to do more than state things in order: a reader should be
 * able to see where they are, know what question is on the table before the
 * argument for it starts, and leave each section with one sentence they could
 * repeat. These components carry that structure so the prose does not have to.
 *
 * Colour discipline: this introduces no new hues. The glyphs below are drawn
 * with the same three signal colours used inside every figure — amber for the
 * environment, blue for the body, magenta for a derived measure — so that a
 * reader who learns the mapping once keeps reading it correctly in the chrome
 * as well as in the data.
 */

export type Family = "linear" | "oscillatory" | "information" | "complexity";

/* ------------------------------------------------------------------ glyphs */

/**
 * Small pictograms, one per family, each drawing the *relationship* that family
 * is built to detect rather than a decorative icon. They appear beside the
 * section heading and again in the summary table, so the shape and the name
 * get bound together.
 */
export function FamilyGlyph({ family, size = 46 }: { family: Family; size?: number }) {
	const h = size * 0.55;
	const common = { fill: "none", strokeWidth: 1.6, strokeLinecap: "round" as const };

	return (
		<svg width={size} height={h} viewBox="0 0 46 26" aria-hidden className="shrink-0">
			{family === "linear" && (
				<>
					{/* Same shape twice, the second shifted right: covariation with a lag. */}
					<path d="M2 13c3-9 7-9 10 0s7 9 10 0" stroke={SERIES_COLOR.world} {...common} />
					<path d="M12 13c3-9 7-9 10 0s7 9 10 0" stroke={SERIES_COLOR.body} {...common} />
					<path
						d="M24 21h8"
						stroke="currentColor"
						className="text-muted"
						strokeWidth={1}
						strokeLinecap="round"
					/>
					<path
						d="M24 21l2-1.6M24 21l2 1.6M32 21l-2-1.6M32 21l-2 1.6"
						stroke="currentColor"
						className="text-muted"
						strokeWidth={1}
						strokeLinecap="round"
					/>
				</>
			)}

			{family === "oscillatory" && (
				<>
					{/* Two phasors held at a fixed angle: the offset is constant. */}
					<circle cx="23" cy="13" r="9.5" stroke="currentColor" className="text-rule" strokeWidth={1} fill="none" />
					<path d="M23 13L32.5 13" stroke={SERIES_COLOR.world} {...common} />
					<path d="M23 13L23 3.5" stroke={SERIES_COLOR.body} {...common} />
					<path
						d="M29.5 13A6.5 6.5 0 0 0 23 6.5"
						stroke={SERIES_COLOR.result}
						fill="none"
						strokeWidth={1.4}
					/>
				</>
			)}

			{family === "information" && (
				<>
					{/* A fold: strong dependence, zero correlation. */}
					<path d="M6 21c5-16 12-16 17 0" stroke={SERIES_COLOR.result} {...common} opacity={0.35} />
					{[
						[7, 18],
						[10, 10],
						[14.5, 5.5],
						[19, 10],
						[22, 18],
						[26, 9],
						[31, 5.5],
						[36, 12],
						[39, 19],
					].map(([cx, cy], i) => (
						<circle key={i} cx={cx} cy={cy} r={1.5} fill={SERIES_COLOR.result} />
					))}
				</>
			)}

			{family === "complexity" && (
				<>
					{/* Two log-log lines of equal slope: matched scaling, different signals. */}
					<path d="M5 22L41 7" stroke={SERIES_COLOR.world} {...common} />
					<path d="M5 25L41 10" stroke={SERIES_COLOR.body} strokeDasharray="4 3" {...common} />
				</>
			)}
		</svg>
	);
}

/* ------------------------------------------------------------ step heading */

/** Numbered section heading. The numeral gives the page a sense of travel — a
 *  reader can tell how far in they are without a progress bar. */
export function Step({
	n,
	id,
	eyebrow,
	title,
	glyph,
}: {
	n: number;
	id: string;
	eyebrow: string;
	title: string;
	glyph?: Family;
}) {
	return (
		<header className="mb-6 border-t border-rule pt-6">
			<div className="flex items-start gap-4">
				<span
					aria-hidden
					className="mt-0.5 select-none font-sans text-3xl leading-none tabular-nums text-rule"
				>
					{String(n).padStart(2, "0")}
				</span>
				<div className="min-w-0 flex-1">
					<p className="font-sans text-[10px] uppercase tracking-[0.22em] text-muted">
						{eyebrow}
					</p>
					<h2 id={id} className="mt-1.5 scroll-mt-8 text-2xl leading-snug md:text-[1.75rem]">
						{title}
					</h2>
				</div>
				{glyph && (
					<div className="hidden pt-1 sm:block">
						<FamilyGlyph family={glyph} />
					</div>
				)}
			</div>
		</header>
	);
}

/* --------------------------------------------------------------- callouts */

/**
 * The question a family asks, stated before the argument for it. Deliberately
 * the first thing under each family heading: the rest of the section is only
 * an elaboration of this one line.
 */
export function Asks({ children }: { children: ReactNode }) {
	return (
		<div className="my-6 flex gap-3 rounded-sm bg-foreground/[0.04] p-4">
			<span
				aria-hidden
				className="mt-1 h-full w-[2px] shrink-0 rounded-full"
				style={{ background: SERIES_COLOR.result }}
			/>
			<div>
				<p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
					The question it asks
				</p>
				<p className="mt-1.5 font-serif text-lg leading-snug text-foreground">{children}</p>
			</div>
		</div>
	);
}

/** One-sentence takeaway, closing a section. */
export function KeyIdea({ children }: { children: ReactNode }) {
	return (
		<p
			className="my-6 border-l-2 pl-4 font-serif text-lg leading-relaxed text-foreground"
			style={{ borderColor: SERIES_COLOR.result }}
		>
			<span className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
				In one sentence
			</span>
			<br />
			{children}
		</p>
	);
}

/** What this family cannot see. Paired with `Asks`, it keeps the page honest —
 *  every instrument here has a blind spot, and naming it is most of the lesson. */
export function BlindSpot({ children }: { children: ReactNode }) {
	return (
		<p className="my-6 font-sans text-sm leading-relaxed text-muted">
			<span className="uppercase tracking-[0.16em] text-foreground/70">Blind to · </span>
			{children}
		</p>
	);
}

/* ------------------------------------------------------- the four families */

const FAMILIES: {
	family: Family;
	name: string;
	asks: string;
	misses: string;
	href: string;
}[] = [
	{
		family: "linear",
		name: "Linear",
		asks: "Do they rise and fall together, allowing for a delay?",
		misses: "Anything that bends, and anything locked out of step.",
		href: "#linear",
	},
	{
		family: "oscillatory",
		name: "Oscillatory",
		asks: "Is the timing relationship between them stable?",
		misses: "Relationships with no rhythm to hold on to.",
		href: "#oscillatory",
	},
	{
		family: "information",
		name: "Information",
		asks: "Does knowing one reduce uncertainty about the other?",
		misses: "Direction and sign — it cannot say which way, or more-or-less.",
		href: "#information",
	},
	{
		family: "complexity",
		name: "Complexity",
		asks: "Do they vary in the same way, across scales?",
		misses: "Everything about timing. Two matched signals need never align.",
		href: "#complexity",
	},
];

/**
 * The map, placed before the journey. A reader who meets four estimators one
 * after another has to hold the whole set in their head to see the point; a
 * reader who sees the four questions first knows what each section is for
 * before it starts.
 */
export function FourQuestions() {
	return (
		<div className="my-10 rounded-sm border border-rule">
			<p className="border-b border-rule px-4 py-3 font-sans text-[10px] uppercase tracking-[0.22em] text-muted sm:px-5">
				Four families · four different questions
			</p>
			<ul className="divide-y divide-rule">
				{FAMILIES.map((f, i) => (
					<li key={f.family}>
						<a
							href={f.href}
							className="group flex items-start gap-4 px-4 py-4 transition-colors hover:bg-foreground/[0.03] sm:px-5"
						>
							<span
								aria-hidden
								className="mt-1 w-5 shrink-0 font-sans text-xs tabular-nums text-rule"
							>
								{String(i + 3).padStart(2, "0")}
							</span>
							<span className="mt-0.5 hidden shrink-0 sm:block">
								<FamilyGlyph family={f.family} size={40} />
							</span>
							<span className="min-w-0 flex-1">
								<span className="block font-sans text-[11px] uppercase tracking-[0.16em] text-foreground">
									{f.name}
								</span>
								<span className="mt-1 block font-serif text-[15px] leading-snug text-foreground/85">
									{f.asks}
								</span>
								<span className="mt-1 block font-sans text-xs leading-relaxed text-muted">
									Blind to: {f.misses}
								</span>
							</span>
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
