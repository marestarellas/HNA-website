/**
 * The four coupling families and their identity colours.
 *
 * Deliberately in its own module with NO `"use client"` directive. When a
 * Server Component imports a plain value from a client module, Next hands back
 * a client-reference proxy rather than the object itself, so property lookups
 * silently return `undefined` and you get `var(undefined)` in the markup with
 * no error anywhere. Shared constants that both sides read have to live in a
 * module neither side has claimed.
 *
 * The colours themselves are defined in globals.css and re-stepped per theme;
 * these are only the token names. They are shared between the framework-matrix
 * columns and the family sections on purpose: the colour that marks the
 * Oscillatory column is the colour that marked the Oscillatory section, so a
 * reader arrives at the matrix already knowing how to read it.
 */

export type Family = "linear" | "oscillatory" | "information" | "complexity";

export const FAMILY_TOKEN: Record<Family, string> = {
	linear: "--fam-linear",
	oscillatory: "--fam-oscillatory",
	information: "--fam-information",
	complexity: "--fam-complexity",
};
