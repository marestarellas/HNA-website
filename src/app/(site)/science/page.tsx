import type { Metadata } from "next";
import { Part, Step, Asks, KeyIdea, BlindSpot } from "@/components/demos/_didactic";
import { NatureVsRest } from "@/components/science/NatureVsRest";
import { ConditionContrast } from "@/components/science/ConditionContrast";
import { PhaseConvergence } from "@/components/science/PhaseConvergence";

export const metadata: Metadata = {
	title: "Science · Attuning to Nature",
	description:
		"Preliminary results from a coastal field pilot: five people, two coastlines, and whether breathing falls into step with the slow swell of the sea.",
};

const CONTENTS = [
	{ id: "pilot", label: "01 · What we did" },
	{ id: "premise", label: "02 · Is there anything to track?" },
	{ id: "contrast", label: "03 · Nature against rest" },
	{ id: "conditions", label: "04 · Which sense carries it" },
	{ id: "phase", label: "05 · The same point in the breath" },
];

export default function SciencePage() {
	return (
		<article className="mx-auto w-full max-w-3xl px-6 py-16 font-serif">
			<p className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
				Science · preliminary
			</p>
			<h1 className="mt-3 text-4xl leading-tight md:text-5xl">
				Five people on two coastlines
			</h1>
			<p className="mt-6 text-xl leading-relaxed text-foreground/85">
				We sat people in front of the sea, recorded their brain, heart and breathing
				alongside the sound of the water, and asked whether the body falls into step
				with it.
			</p>
			<p className="mt-4 text-lg leading-relaxed text-foreground/85">
				This is a pilot. Five subjects, one session each, blocks of a few minutes. It
				was run to find out whether the recording and the analysis work at all before
				committing to the full study, and that is the weight the results on this page
				can carry. Everything below is drawn from the analysis output, and every
				figure names the file it came from.
			</p>

			<nav aria-label="Contents" className="mt-10 border-y border-rule py-5">
				<ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
					{CONTENTS.map((c) => (
						<li key={c.id}>
							<a
								href={`#${c.id}`}
								className="font-sans text-[11px] uppercase tracking-[0.12em] text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
							>
								{c.label}
							</a>
						</li>
					))}
				</ul>
			</nav>

			{/* ===================================================== PART ONE ===== */}
			<Part
				n={1}
				label="Part one"
				title="The recording"
				blurb="What was measured, where, and the one thing that has to be true before any of the rest is worth asking."
			/>

			<section>
				<Step n={1} id="pilot" eyebrow="The field" title="A microphone, a body, and the sea" />
				<p className="text-lg leading-relaxed text-foreground/85">
					Five adults took part in outdoor sessions facing the water, on the Chilean
					coast and on Mallorca. Each wore 32-channel EEG, a single-lead ECG and a
					respiration belt, while a binaural microphone beside them recorded the same
					sea they were sitting in front of. All the streams share a clock.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					Each person met the sea three ways, in blocks of three to six minutes:
					watching it with their hearing blocked, listening to it with their eyes
					covered, and both at once. Two silent rests bracketed the session, one before
					and one after, and those are what the nature blocks get compared against.
				</p>

				<figure className="my-10">
					<div className="grid gap-3 sm:grid-cols-2">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/science/fieldwork_mallorca.jpg"
							alt="A rocky cove on the Mallorcan coast, with recording equipment set up facing the water."
							className="w-full rounded-sm"
							loading="lazy"
						/>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/science/fieldwork_valdivia.jpg"
							alt="A beach at dusk on the Chilean coast during a recording session."
							className="w-full rounded-sm"
							loading="lazy"
						/>
					</div>
					<figcaption className="mt-3 font-sans text-xs leading-relaxed text-muted">
						Mallorca and the Chilean coast. The sea is not a stimulus played to a
						participant here. It is the room they are sitting in, recorded at the same
						time as the body that is in it.
					</figcaption>
				</figure>
			</section>

			<section className="mt-16">
				<Step n={2} id="premise" eyebrow="The premise" title="Is there anything in the sound a body could track?" />
				<Asks>Do the sea and the breath even operate at the same speeds?</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					Before asking whether the body follows the water, the water has to carry energy
					at a rate the body could plausibly follow. It does. The slow swell of the audio
					sits mostly below 0.1 Hz, and breathing sits around 0.25 Hz, inside the band it
					always occupies. They overlap enough for the question to be worth asking.
				</p>

				<figure className="my-10">
					<div className="rounded-sm border border-rule bg-background p-4 sm:p-5">
						<p className="mb-3 font-sans text-[10px] uppercase tracking-[0.22em] text-muted">
							Audio, breathing and heart rate, group mean
						</p>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/science/spectrum_overlay.png"
							alt="Power spectra of the audio swell envelope, respiration and instantaneous heart rate. The swell is concentrated below 0.1 hertz, respiration peaks near 0.25 hertz, and heart rate is broadband and slow."
							className="w-full"
							loading="lazy"
						/>
					</div>
					<figcaption className="mt-3 font-sans text-xs leading-relaxed text-muted">
						The one figure here taken from the report as an image rather than redrawn
						from data, because the underlying spectra were not saved alongside the other
						results. Shaded bands are the standard error across the fifteen recordings,
						and the lavender strip marks the usual range of human breathing.
					</figcaption>
				</figure>

				<KeyIdea>
					The sea moves slowly enough, and breathing is slow enough, that the two could in
					principle keep time with each other.
				</KeyIdea>
			</section>

			{/* ===================================================== PART TWO ===== */}
			<Part
				n={2}
				label="Part two"
				title="What came out"
				blurb="Three results the pilot supports, each a comparison rather than an absolute claim, and each shown with all five subjects visible."
			/>

			<section>
				<Step n={3} id="contrast" eyebrow="Nature against rest" title="Breathing couples more with the sea than with silence" />
				<p className="text-lg leading-relaxed text-foreground/85">
					Pooling the three nature blocks against the two rests gives one comparison per
					subject. The phase measures, which ask whether two rhythms hold a steady timing
					relationship, go up during nature. Phase-locking value gives{" "}
					<span className="font-sans tabular-nums">p = 0.027</span> and the weighted
					phase-lag index <span className="font-sans tabular-nums">p = 0.0067</span>, both
					from a model fitted on roughly 440 windowed values.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					Those two are the breathing rows below. The same contrast was run against two
					derivations of the heartbeat as well, and those are shown beside them.
				</p>

				<NatureVsRest />

				<BlindSpot>
					multiplicity. Twelve comparisons were run and none of these p-values are
					corrected for that. At this size the honest reading is a direction worth
					following, not a result to bank.
				</BlindSpot>
			</section>

			<section className="mt-16">
				<Step n={4} id="conditions" eyebrow="Which sense" title="Listening does it; looking does not" />
				<Asks>Does it matter which sense the sea arrives through?</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					Among the three conditions, listening with eyes covered produces the strongest
					respiratory coupling, around twice what watching or watching-and-listening give.
					Adding vision does not add to it. It takes it away.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					Two measures are shown because they fail differently. The weighted phase-lag
					index throws away the zero-lag part of the relationship, which is the part a
					shared artefact would produce, so when it agrees with the plain phase-locking
					value the result is harder to explain away. Here they agree.
				</p>

				<ConditionContrast />

				<KeyIdea>
					Listening to the sea couples breathing to it about twice as strongly as looking
					at it does, and adding sight to sound does not help.
				</KeyIdea>
				<p className="mt-4 font-sans text-sm leading-relaxed text-muted">
					The pilot also ran coherence, cross-correlation and mutual information, which
					answer differently. The four families of coupling measure, and what each is
					blind to, are worked through properly in{" "}
					<a
						href="/learn/attunement"
						className="underline underline-offset-4 transition-colors hover:text-foreground"
					>
						Learn: Attunement
					</a>
					.
				</p>
			</section>

			<section className="mt-16">
				<Step n={5} id="phase" eyebrow="Timing" title="And they do it at the same point in the breath" />
				<p className="text-lg leading-relaxed text-foreground/85">
					This is the cleanest thing five subjects can show. For each person we take the
					breathing phase at which their coupling to the swell was strongest, and ask
					whether those phases agree across people. Under listening they largely do, with
					four of five subjects internally consistent and the group resultant at{" "}
					<span className="font-sans tabular-nums">R = 0.73</span>, which the report gives
					as <span className="font-sans tabular-nums">p = 0.060</span>, a trend. Add vision
					and the agreement collapses to{" "}
					<span className="font-sans tabular-nums">R = 0.22</span>.
				</p>

				<PhaseConvergence />

				<KeyIdea>
					Something about watching the sea moves each person&rsquo;s timing in a different
					direction, while listening to it moves them all to the same place.
				</KeyIdea>
			</section>

		</article>
	);
}
