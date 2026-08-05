import { StubPage } from "@/components/StubPage";
import { CoupledOscillators } from "@/components/demos/CoupledOscillators";

export default function LearnPage() {
	return (
		<StubPage
			eyebrow="Section 2"
			title="Learn"
			intro="The teaching core. Short Remotion-rendered animations for the intuition of each concept, prose explanations in MDX, and live React demos where touching a parameter helps you feel what is happening."
			willInclude={[
				"What is entrainment?",
				"Forms of coupling — unidirectional, bidirectional, mutual; physiological, behavioral, environmental.",
				"Complexity matching — what it is, why it matters, how it is measured.",
				"More concepts as the strategies docs grow.",
			]}
		>
			<h2 className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
				Live demo · coupled oscillators
			</h2>
			<p className="mt-3 font-sans text-sm leading-relaxed text-foreground/75">
				Two oscillators with slightly different natural frequencies. Drag
				the coupling strength up and watch them lock into phase. This is the
				simplest possible illustration of entrainment, and it is here to
				prove the interactivity pipeline works — the real demo will be more
				considered.
			</p>
			<div className="mt-6">
				<CoupledOscillators />
			</div>
		</StubPage>
	);
}
