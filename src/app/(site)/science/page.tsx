import { StubPage } from "@/components/StubPage";

export default function SciencePage() {
	return (
		<StubPage
			eyebrow="Section 1"
			title="Science"
			intro="The empirical study behind the project: what we are measuring, why, and what we are finding so far. Treated as a living lab notebook page that grows as data comes in."
			willInclude={[
				"A short, plainly written abstract of the study on human–environment coupling.",
				"A Methods subsection, likely a Remotion-rendered animation, possibly an interactive React equivalent.",
				"Findings so far: figures with real captions, axis labels, links back to the source.",
				"A What's next note. Honest about being in progress.",
			]}
		/>
	);
}
