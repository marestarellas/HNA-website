import { StubPage } from "@/components/StubPage";

export default function StoriesPage() {
	return (
		<StubPage
			eyebrow="Section 3"
			title="Stories, Myths, and People (and Animals) of the Land"
			intro="A world map slowly filling with stories shared by visitors — personal experiences and inherited folklore of places, organisms, elements, and times. The most ambitious section. Treated as the heart of the site."
			willInclude={[
				"A full-page stylized world map (MapLibre, custom muted style — definitely not Google Maps blue).",
				"A wheel-of-choice for selecting what the story is connected to: landscapes, organisms, forces / elements, times / cycles.",
				"A sharing flow that defaults to voice — speak the story, transcribe with Whisper, store both audio and text.",
				"A brief plain-language consent screen. Visible deletion path on every story.",
				"An optional five-minute phenomenological questionnaire focused on memory of place.",
				"Aggregate views: stories of the wind, stories of the desert, stories told to children.",
			]}
		/>
	);
}
