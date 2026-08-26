import { StubPage } from "@/components/StubPage";

export default function ExperimentPage() {
	return (
		<StubPage
			eyebrow="Section 4"
			title="Experiment"
			intro="A short sequence of generated nature stimuli, with a brief phenomenological self-report after each. A research-grade data-collection instrument disguised as an experience, and the most controlled UX on the site."
			willInclude={[
				"Strict consent flow at entry. IRB-grade language, plain enough to actually read.",
				"A library of generated stimuli (Tessendorf seascapes, L-system forests, fractal Brownian motion). Sequencing strategy is configurable: random, balanced, adaptive.",
				"After each stimulus, a tight repeated-measures phenomenological instrument.",
				"Session resumption if the visitor closes the tab.",
				"Gated CSV / Parquet export for the science team.",
			]}
		>
			<h2 className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
				Data handling · current state
			</h2>
			<p className="mt-3 font-sans text-sm leading-relaxed text-foreground/75">
				Until IRB lands, the &quot;save response&quot; path is gated behind
				a feature flag (default off). When the flag is off the experience
				runs end-to-end but no data leaves the browser, and visitors see a
				visible &quot;preview: your responses are not stored&quot; notice.
				Flip the flag once consent and ethics are in place.
			</p>
		</StubPage>
	);
}
