import type { Metadata } from "next";
import { ChoosingAnObservable } from "@/components/demos/ChoosingAnObservable";
import { CouplingDesignSpace } from "@/components/demos/CouplingDesignSpace";
import { LaggedCrossCorrelation } from "@/components/demos/LaggedCrossCorrelation";
import { PhaseLocking } from "@/components/demos/PhaseLocking";
import { NonlinearDependence } from "@/components/demos/NonlinearDependence";
import { ComplexityMatching } from "@/components/demos/ComplexityMatching";
import { SurrogateTest } from "@/components/demos/SurrogateTest";
import {
	Step,
	Asks,
	KeyIdea,
	BlindSpot,
	FourQuestions,
} from "@/components/demos/_didactic";

export const metadata: Metadata = {
	title: "Learn — Attuning to Nature",
	description:
		"The fundamental principles behind measuring whether two things are coupled: choosing an observable, the four families of coupling, and how to tell a real relationship from an accident.",
};

const SECTIONS = [
	{ id: "problem", label: "01 · The problem" },
	{ id: "observable", label: "02 · An observable" },
	{ id: "linear", label: "03 · Linear" },
	{ id: "oscillatory", label: "04 · Oscillatory" },
	{ id: "information", label: "05 · Information" },
	{ id: "complexity", label: "06 · Complexity" },
	{ id: "design-space", label: "07 · The whole space" },
	{ id: "surrogates", label: "08 · Is it real?" },
];

export default function LearnPage() {
	return (
		<article className="mx-auto w-full max-w-3xl px-6 py-16 font-serif">
			{/* ---------------------------------------------------------------- lede */}
			<p className="font-sans text-xs uppercase tracking-[0.22em] text-muted">Section 2</p>
			<h1 className="mt-3 text-4xl leading-tight md:text-5xl">
				How to measure an attunement
			</h1>
			<p className="mt-6 text-xl leading-relaxed text-foreground/85">
				Two things unfold in time — a tide and a breath, a birdsong and a heartbeat, a
				canopy moving in wind and the eyes moving across it — and you want to know
				whether they are related.
			</p>
			<p className="mt-4 text-lg leading-relaxed text-foreground/85">
				That question sounds simple and is not, because &ldquo;related&rdquo; turns out
				to mean at least four different things. This page walks through them one at a
				time. Every figure computes what it claims to — real transforms on real
				synthetic signals — so you can move a control and watch the answer change
				rather than take a diagram&rsquo;s word for it.
			</p>

			<nav aria-label="Sections" className="mt-10 border-y border-rule py-4">
				<ul className="flex flex-wrap gap-x-5 gap-y-2">
					{SECTIONS.map((s) => (
						<li key={s.id}>
							<a
								href={`#${s.id}`}
								className="font-sans text-[11px] uppercase tracking-[0.14em] text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
							>
								{s.label}
							</a>
						</li>
					))}
				</ul>
			</nav>

			{/* ------------------------------------------------------------- 01 problem */}
			<section className="mt-14">
				<Step
					n={1}
					id="problem"
					eyebrow="The problem"
					title="One number cannot answer this"
				/>
				<p className="text-lg leading-relaxed text-foreground/85">
					Put any two recordings side by side and, usually, nothing lines up. Correlate
					them and you get a number near zero — honest, and useless. Because you asked
					whether they rise and fall <em>together</em>, and that is only one of the ways
					two things can be bound to each other.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					One might follow the other after a delay. It might keep time with its rhythm
					while staying permanently out of step. It might respond in a way that bends,
					so a real dependence averages out to nothing. Or it might not agree in timing
					at all, and instead share the <em>texture</em> of its variability.
				</p>

				<KeyIdea>
					Four different relationships, four different instruments. Reaching for the
					wrong one does not give you a weak answer — it gives you zero, confidently.
				</KeyIdea>

				<p className="mt-6 text-lg leading-relaxed text-foreground/85">
					Here is the whole map before we start. Each of these is a section below.
				</p>
				<FourQuestions />
			</section>

			{/* ---------------------------------------------------------- 02 observable */}
			<section className="mt-14">
				<Step
					n={2}
					id="observable"
					eyebrow="Before any comparison"
					title="First decide what you are comparing"
				/>
				<p className="text-lg leading-relaxed text-foreground/85">
					Almost every signal worth studying is really two signals stacked together:
					something fast, and a slower shape riding on top of it. A voice has a pitch
					and a cadence. A flame has a flicker and a guttering. Footsteps have an impact
					and a gait. Usually the slow shape carries the relationship you are hunting,
					and the fast one is merely the carrier it is written on.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					So the first move is not a comparison at all. It is a reduction: turn each
					recording into one slow trace of how much is happening. Do that to two
					unlike signals and they become the same kind of object, sampled at the same
					rate — and every method further down this page will work on them without
					knowing or caring where they came from.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					But <em>how</em> you get that trace is not one recipe. Compare the three
					below. A sound gives up its envelope directly. An EEG has to be band-limited
					first, because what waxes and wanes is the power in one rhythm rather than
					the whole trace. And an ECG is not an amplitude problem at all — its
					information is in the spacing between beats, so the slow trace comes from
					counting time, not measuring size.
				</p>
				<ChoosingAnObservable />

				<KeyIdea>
					Choosing the observable is a modelling decision, not a preprocessing step.
					It encodes what you think matters about the signal — and applying the same
					transform to everything because it worked once is the fastest way to measure
					something real about a quantity nobody cares about.
				</KeyIdea>
			</section>

			{/* ------------------------------------------------------------- 03 linear */}
			<section className="mt-14">
				<Step
					n={3}
					id="linear"
					eyebrow="Family one"
					title="Linear — moving together, in step"
					glyph="linear"
				/>
				<Asks>Do they rise and fall together, allowing for a delay?</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					The simplest question, and the one worth asking first. Its subtlety is the
					delay: effects take time to travel, so a correlation computed where two
					signals happen to sit will understate a real relationship badly. Slide one
					past the other and take the peak.
				</p>
				<LaggedCrossCorrelation />
				<BlindSpot>
					relationships that bend, and anything locked at a constant offset — both
					register as roughly zero.
				</BlindSpot>
				<KeyIdea>
					The lag is often worth more than the correlation. A strength is a
					description; a delay is a claim about mechanism.
				</KeyIdea>
			</section>

			{/* -------------------------------------------------------- 04 oscillatory */}
			<section className="mt-14">
				<Step
					n={4}
					id="oscillatory"
					eyebrow="Family two"
					title="Oscillatory — keeping time"
					glyph="oscillatory"
				/>
				<Asks>Is the timing relationship between them stable?</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					Entrainment is not really about amplitudes agreeing. It is about a{" "}
					<em>constant</em> relationship in phase — one thing keeping time with another,
					whatever the offset between them happens to be. Phase-locking value asks that
					and nothing else: is the gap the same now as it was a moment ago?
				</p>
				<PhaseLocking />
				<p className="mt-1 text-lg leading-relaxed text-foreground/85">
					Coherence asks a stricter version, requiring phase <em>and</em> amplitude to
					agree together. That strictness has a real cost: on signals whose loudness
					wanders — which is most natural ones — it refuses to see relationships a
					phase-only measure finds easily.
				</p>
				<BlindSpot>
					relationships with no rhythm to hold on to. Phase is only meaningful for
					something that oscillates.
				</BlindSpot>
				<KeyIdea>
					Two signals can be perfectly locked and completely uncorrelated at the same
					time. Choosing the estimator that matches the kind of regularity a signal
					actually has is not a technicality — it is most of the analysis.
				</KeyIdea>
			</section>

			{/* -------------------------------------------------------- 05 information */}
			<section className="mt-14">
				<Step
					n={5}
					id="information"
					eyebrow="Family three"
					title="Information — any dependence at all"
					glyph="information"
				/>
				<Asks>Does knowing one of them reduce your uncertainty about the other?</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					A correlation of zero means &ldquo;no <em>linear</em> relationship&rdquo;. It
					does not mean the two are unrelated, and reading it that way discards every
					relationship that bends. Mutual information asks the general question instead,
					and does not care what shape the answer takes.
				</p>
				<NonlinearDependence />
				<BlindSpot>
					direction and sign. It will tell you the two are bound together, never that
					more of one meant less of the other. Granger causality and transfer entropy
					belong to this family and add the direction back.
				</BlindSpot>
				<KeyIdea>
					Generality is not free: this measure reports dependence that is not there
					whenever signals are smooth — which is exactly why the last section exists.
				</KeyIdea>
			</section>

			{/* --------------------------------------------------------- 06 complexity */}
			<section className="mt-14">
				<Step
					n={6}
					id="complexity"
					eyebrow="Family four"
					title="Complexity — a shared way of varying"
					glyph="complexity"
				/>
				<Asks>Do they vary in the same way, across scales?</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					The strangest family, and the one that best fits what attunement between a
					body and a place might actually be. Two things can be deeply related without
					ever lining up in time. What they share instead is the{" "}
					<em>statistical structure</em> of their fluctuations — how variability at fine
					scales relates to variability at coarse ones.
				</p>
				<ComplexityMatching />
				<BlindSpot>
					timing, entirely. Two perfectly matched signals need never coincide, and this
					measure would not notice if they did.
				</BlindSpot>
				<KeyIdea>
					Attunement need not mean simultaneity. Two people walking together do not
					synchronise step for step, yet the scaling of their gait variability
					converges.
				</KeyIdea>
			</section>

			{/* -------------------------------------------------------- 07 design space */}
			<section className="mt-14">
				<Step
					n={7}
					id="design-space"
					eyebrow="Zooming out"
					title="The whole space, in one grid"
				/>
				<p className="text-lg leading-relaxed text-foreground/85">
					Now that the four questions are familiar, the rest of the field collapses into
					something small. Every coupling method is a choice of <em>what to compare</em>{" "}
					— the raw trace, an oscillatory feature, a complexity feature — crossed with
					one of the four ways of comparing it. Two formidable-sounding methods turn out
					to be combinations you already understand.
				</p>
				<CouplingDesignSpace />
			</section>

			{/* ---------------------------------------------------------- 08 surrogates */}
			<section className="mt-14">
				<Step
					n={8}
					id="surrogates"
					eyebrow="The check that makes it mean something"
					title="You need to know what nothing looks like"
				/>
				<Asks>How large would this number be if there were no relationship at all?</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					Every estimator above returns a number greater than zero even when there is
					nothing there. Smooth signals correlate by accident. Autocorrelated signals
					manufacture mutual information out of nothing. A recording that looks
					generously long contains far fewer independent observations than it does
					samples.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					The defence is to build a null on purpose: destroy the relationship while
					keeping everything else — same spectrum, same autocorrelation, same
					distribution — measure again, and repeat until you know the shape of nothing.
					Then ask where your real number falls in it.
				</p>
				<SurrogateTest />
				<KeyIdea>
					A coupling value on its own is not a result. The result is where it sits
					relative to a null you built deliberately.
				</KeyIdea>
			</section>

			{/* ------------------------------------------------------------- closing */}
			<section className="mt-14">
				<Step
					n={9}
					id="choosing"
					eyebrow="The principle underneath"
					title="No measure is best; each one is a question"
				/>
				<p className="text-lg leading-relaxed text-foreground/85">
					It is tempting to look for the most sensitive method and use it everywhere.
					The four demos above show why that instinct fails. Build a pair coupled purely
					in phase and the linear measure reports nothing. Build a pair coupled through
					a fold and the phase measure reports nothing. Match two signals in scaling
					alone and every timing-based measure returns zero — correctly, because there
					is no timing relationship to find.
				</p>
				<KeyIdea>
					The real work happens before any estimator runs: deciding what kind of
					relationship you think is there, and therefore what would count as evidence.
					A method chosen after seeing the data is not a measurement — it is a
					preference.
				</KeyIdea>
				<p className="mt-6 text-lg leading-relaxed text-foreground/85">
					That is also the honest reason to show four rather than name a favourite.
					Attunement between a living thing and its surroundings almost certainly is not
					one phenomenon. A body may track a rhythm in one respect, ignore it in
					another, and share a texture with it in a third — at once, and all of it real.
				</p>
			</section>

			<section className="mt-16 border-t border-rule pt-8">
				<p className="font-sans text-xs leading-relaxed text-muted">
					The figures on this page are working miniatures — genuine FFTs, genuine
					detrended fluctuation analysis, genuine surrogate distributions — deliberately
					simpler in their estimator choices than a research implementation would be,
					and each caption says where it simplifies. Still to be written: cross-frequency
					phase–amplitude coupling in its own right, how these measures behave on signals
					that are not stationary, and what changes when you have many channels rather
					than two.
				</p>
			</section>
		</article>
	);
}
