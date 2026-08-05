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
			"A world map of personal stories and inherited folklore — slowly inhabited by visitors, one pin at a time.",
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
		slug: "editorial",
		number: "01",
		name: "Editorial Magazine",
		tagline: "the magazine cover for a science of nature",
		rationale:
			"Photography-led, large display serif overlaid on imagery, the four sections shown as magazine covers in a grid. Closest to the Atmos / The Overview references — editorial confidence, willing to be intimate and strange.",
	},
	{
		slug: "immersive",
		number: "02",
		name: "Immersive Cinematic",
		tagline: "scene by scene, you walk through it",
		rationale:
			"Each section is a full-bleed photographic scene that fills the viewport. You scroll, the next scene cinematically dissolves in over the previous one. Type appears centered and oversized. Custom small cursor. The whole page becomes a sequence you walk through.",
	},

	// — Earthy / abstract / wavy — share a typographic family with the Poem
	//   register and lean into texture and flow over photography ———————————

	{
		slug: "waves",
		number: "03",
		name: "Veil of Waves",
		tagline: "translucent silks of color, drifting",
		rationale:
			"Many translucent SVG wave layers in earth tones drift over each other like silk fabrics caught in slow current. Massive italic serif sits over them. The whole page reads as a single continuous slow surface. The most literal interpretation of 'flowy'.",
	},
	{
		slug: "strata",
		number: "04",
		name: "Strata",
		tagline: "the long compression of time, in bands",
		rationale:
			"Horizontal sediment bands stacked vertically — each a different earth color, each with a hand-eroded wavy edge that drifts slowly. Heavy grain texture overlay. Scroll subtly compresses the strata. Reads as deep time made visible. The earthiest of the set.",
	},
	{
		slug: "tide",
		number: "05",
		name: "Tide / Ink",
		tagline: "warm pigment dispersing in still water",
		rationale:
			"Organic ink-like blobs in burnt sienna and deep ochre slowly morph between forms, as if pigment were dispersing in water and resettling. SVG turbulence on the edges so the bleed is wet, not hard. Type sits over the dispersion. Painterly, abstract, alive.",
	},
	{
		slug: "lichen",
		number: "06",
		name: "Lichen / Patina",
		tagline: "the close-up surface of slow time",
		rationale:
			"Heavy grain everywhere — like rust patina, lichen on stone, fired clay. Tiny radial pulses bloom and fade across the page like microscopic spores opening. Muted greens, rust, oxidized cream. The most textural and most intimate-scale of the set.",
	},
	{
		slug: "dune",
		number: "07",
		name: "Dune",
		tagline: "long horizontal flow under low sun",
		rationale:
			"Long undulating curves like wind-drifted sand under raking light, simplified to abstract horizontal flow. Re-paletted to dusk: warm cream sky, atmospheric blue ridges, terracotta and forest mid-bands, near-black foreground. The most spacious and atmospheric of the set.",
	},
	{
		slug: "refract",
		number: "08",
		name: "Refract",
		tagline: "moving lenses reveal what is underneath",
		rationale:
			"Underwater register. Deep teal field with caustic light continuously rippling across the whole viewport. Each section image holds a cursor-following lens — move it over the photo and the surface is cut away to reveal a 'hidden' version: chromatic-shifted, with a faint EEG signal trace and frequency labels underneath. The optics are real (chromatic-aberration ring on the lens edge). Ties the dream-of-nature visual directly to the project's premise — that the science is what is underneath the experience of nature.",
	},
];
