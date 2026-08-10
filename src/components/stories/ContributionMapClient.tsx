"use client";

import dynamic from "next/dynamic";

/**
 * MapLibre reaches for `window` at module scope, so the atlas can only be
 * loaded in the browser. `ssr: false` is not allowed inside a Server Component,
 * which is why this thin wrapper is a Client Component and the page imports it
 * rather than importing the map directly.
 */
const ContributionMap = dynamic(() => import("./ContributionMap"), {
	ssr: false,
	loading: () => (
		<div
			style={{
				minHeight: "60vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontStyle: "italic",
				opacity: 0.6,
			}}
		>
			loading the world…
		</div>
	),
});

export function StoriesMap() {
	return <ContributionMap />;
}
