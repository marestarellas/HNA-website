// Stock-image bank used by the dream-of-nature design directions (06–10).
//
// Each entry is a known-good Unsplash photo. We deliberately avoid the
// stock-leaf-and-spa visual register: these lean toward dim, atmospheric,
// elemental — water, fog, light through canopy, surface texture. Replace with
// the real image bank once it lands.
//
// URL pattern: https://images.unsplash.com/photo-<id>?w=<w>&q=<q>&auto=format&fit=crop

const ID = (id: string, w = 2000, q = 80) =>
	`https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format&fit=crop`;

export const STOCK = {
	forestLight: ID("1441974231531-c6227db76b6e"),       // Lukasz Szmigiel — light through pines
	mistyMountain: ID("1518173946687-a4c8892bbd9f"),     // misty ridge
	foggyForest: ID("1502082553048-f009c37129b9"),       // fog among trees
	mountainDistance: ID("1426604966848-d7adac402bff"),  // mountain landscape
	autumnLeaves: ID("1500382017468-9049fed747ef"),      // close-up autumn
	foggyMountain: ID("1470071459604-3b5ec3a7fe05"),     // foggy mountain
	sunlightTrees: ID("1547036967-23d11aacaee0"),        // sunlight through trees
	plantClose: ID("1418065460487-3e41a6c84dc5"),        // plant close-up
} as const;

export const STOCK_ORDERED = [
	STOCK.forestLight,
	STOCK.mistyMountain,
	STOCK.sunlightTrees,
	STOCK.foggyForest,
	STOCK.mountainDistance,
	STOCK.foggyMountain,
	STOCK.autumnLeaves,
	STOCK.plantClose,
];
