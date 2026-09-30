/**
 * The water column: what colour it is at a given depth, and what colour type
 * has to be to survive there.
 *
 * Separated from the component so the palette can be checked rather than
 * eyeballed. The one thing that can go quietly wrong in a design like this is
 * contrast: a background that interpolates smoothly from cream to near-black
 * passes through every mid tone on the way, and type has to stay readable at
 * each of them. That is a computation, not a matter of taste, so it is here
 * where it can be run.
 */

export type Stop = { at: number; bg: [number, number, number] };

export const COLUMN: Stop[] = [
	{ at: 0.0, bg: [244, 237, 224] }, // surface, full sun
	{ at: 0.18, bg: [223, 226, 216] },
	{ at: 0.3, bg: [185, 196, 194] },
	{ at: 0.42, bg: [85, 112, 126] }, // the light goes fast through here
	{ at: 0.62, bg: [42, 57, 73] },
	{ at: 0.82, bg: [19, 30, 40] },
	{ at: 1.0, bg: [7, 11, 15] },
];

export const INK_DARK = "#1a1612";
export const INK_LIGHT = "#f0e7d3";

/**
 * Where the type changes colour, found by sweeping every candidate and keeping
 * the one whose worst moment is best. Crossfading the ink instead bottoms out
 * at 1.2:1, which is invisible; switching here bottoms out at 3.8:1, in a
 * narrow band around 49m that no section is placed in.
 *
 * 3.8:1 is not a compromise, it is the ceiling. Any continuous background
 * running from cream to near-black passes through mid grey, and against mid
 * grey this ink pair cannot do better: solving for the luminance where dark
 * and cream contrast equally gives 3.79:1. Clears AA for the display sizes
 * used here, and the reason the sections sit at 12, 40, 70 and 98m.
 */
export const INK_SWITCH = 0.41;

export const MAX_DEPTH_M = 120;

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function rgbAt(p: number): [number, number, number] {
	const q = Math.max(0, Math.min(1, p));
	let i = 0;
	while (i < COLUMN.length - 2 && q > COLUMN[i + 1].at) i++;
	const a = COLUMN[i];
	const b = COLUMN[i + 1];
	const t = b.at === a.at ? 0 : (q - a.at) / (b.at - a.at);
	return [0, 1, 2].map((k) =>
		Math.round(lerp(a.bg[k], b.bg[k], Math.max(0, Math.min(1, t))))
	) as [number, number, number];
}

export function bgAt(p: number): string {
	const [r, g, b] = rgbAt(p);
	return `rgb(${r}, ${g}, ${b})`;
}

export function inkAt(p: number): string {
	return p < INK_SWITCH ? INK_DARK : INK_LIGHT;
}

/* ------------------------------------------------------------- contrast */

function channel(v: number): number {
	const s = v / 255;
	return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance([r, g, b]: [number, number, number]): number {
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace("#", "");
	return [
		parseInt(h.slice(0, 2), 16),
		parseInt(h.slice(2, 4), 16),
		parseInt(h.slice(4, 6), 16),
	];
}

/** WCAG contrast ratio, 1 (invisible) to 21 (black on white). */
export function contrastAt(p: number): number {
	const bg = relativeLuminance(rgbAt(p));
	const ink = relativeLuminance(hexToRgb(inkAt(p)));
	const hi = Math.max(bg, ink);
	const lo = Math.min(bg, ink);
	return (hi + 0.05) / (lo + 0.05);
}
