// Shared landing content used by every design direction so we compare
// presentation, not text.

export const SITE_NAME = "attuning to nature";

export const HERO =
	"A scientific and artistic project on how humans attune to, and become coupled with, their environments.";

export const INTRO =
	"Bringing together neuroscience, phenomenology, computer science, and storytelling around a single question: how do bodies fall into rhythm with the places they live in?";

export type SectionEntry = {
	href: string;
	number: string;
	title: string;
	blurb: string;
};

export const SECTIONS: SectionEntry[] = [
	{
		href: "/learn",
		number: "II",
		title: "Learn",
		blurb:
			"What entrainment is. What it means for a brain to lock onto a wave, a forest, a breath.",
	},
	{
		href: "/stories",
		number: "III",
		title: "Stories of the land",
		blurb:
			"A world map of personal stories and inherited folklore, slowly inhabited by visitors, one pin at a time.",
	},
	{
		href: "/experiment",
		number: "IV",
		title: "Experiment",
		blurb:
			"A short sequence of generated nature stimuli, with a brief phenomenological report after each.",
	},
	{
		href: "/science",
		number: "I",
		title: "Science",
		blurb:
			"The empirical study behind the project. Methods, figures, what we are finding so far.",
	},
];

export type DesignMeta = {
	slug: string;
	number: string;
	name: string;
	tagline: string;
	rationale: string;
};

export const DESIGNS: DesignMeta[] = [
	{
		slug: "lichen",
		number: "01",
		name: "Lichen / Patina",
		tagline: "the close-up surface of slow time",
		rationale:
			"Heavy grain everywhere: rust patina, lichen on stone, fired clay. Tiny radial pulses bloom and fade across the page like microscopic spores opening. Muted greens, rust, oxidized cream. The most textural and most intimate-scale of the set.",
	},
	{
		slug: "descent",
		number: "02",
		name: "Descent",
		tagline: "scroll is depth, not distance",
		rationale:
			"The page is a water column read from the surface down. Light drains out of the background along a curve, fine particles drift upward past you because you are the one descending, and a gauge in the margin counts metres. The wave clip appears once, at the top, seen from underneath and out of focus, so water is felt at the boundary rather than shown as scenery.",
	},
	{
		slug: "confluence",
		number: "03",
		name: "Confluence",
		tagline: "four streams gathering into one channel",
		rationale:
			"The navigation is the picture. Each entrance is a rivulet from the top edge, thin at the source and heavier downhill, meandering across wet sand until all four converge and leave as a single channel. Hovering swells one stream and thins the others; clicking sends a pulse down it. Four ways in, one question they drain toward.",
	},
	{
		slug: "immersive",
		number: "04",
		name: "Immersive Cinematic",
		tagline: "scene by scene, you walk through it",
		rationale:
			"Each section is a full-bleed photographic scene that fills the viewport. You scroll, the next scene cinematically dissolves in over the previous one. Type appears centered and oversized. Custom small cursor. The whole page becomes a sequence you walk through.",
	},
	{
		slug: "editorial",
		number: "05",
		name: "Editorial Magazine",
		tagline: "the magazine cover for a science of nature",
		rationale:
			"Photography-led, large display serif overlaid on imagery, the four sections shown as magazine covers in a grid. Closest to the Atmos and The Overview references: editorial confidence, willing to be intimate and strange.",
	},
];
