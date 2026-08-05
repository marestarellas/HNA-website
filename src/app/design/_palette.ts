// Shared chromatic palette pulled from the Editorial direction's section
// covers — the colorway the human approved. The wavy / abstract directions
// pull from this so they read as a family rather than a brown haze.

export const PALETTE = {
	creamBg: "#f4ede0",   // base warm cream background
	cream: "#e9dfca",     // salt flat at midday
	creamText: "#f0e7d3", // slightly warmer cream for type on dark fields

	forest: "#1f3a2e",    // forest, Patagonia
	forestDeep: "#0f2218",
	forestSoft: "#3e5a4a",

	northSea: "#2a3949",  // north sea at dusk
	northSeaDeep: "#101820",
	northSeaSoft: "#4d5d6e",

	atacama: "#a8523a",   // Atacama at dawn (terracotta)
	atacamaDeep: "#7a3a26",
	atacamaSoft: "#c87a5e",

	ochre: "#c69958",     // warm intermediate
	umberDeep: "#2a160a", // near-black warm

	inkText: "#1a1612",   // body type on cream
} as const;
