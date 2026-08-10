import type { Metadata } from "next";
import { StoriesMap } from "@/components/stories/ContributionMapClient";

export const metadata: Metadata = {
	title: "Stories — Attuning to Nature",
	description:
		"A living atlas of how people feel connected to the living world: personal stories, inherited myths, and pareidolia, placed on a map and drawn together by what they share.",
};

// The atlas brings its own palette and page chrome, developed as a standalone
// prototype. It sits inside the site's header/footer so navigation still works.
// When a site-wide design direction is chosen, the two type and colour systems
// get reconciled — until then the map keeps the styling it was designed with.
export default function StoriesPage() {
	return <StoriesMap />;
}
