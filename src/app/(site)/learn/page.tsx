import type { Metadata } from "next";
import { EnvelopeExtraction } from "@/components/demos/EnvelopeExtraction";
import { CouplingDesignSpace } from "@/components/demos/CouplingDesignSpace";
import { LaggedCrossCorrelation } from "@/components/demos/LaggedCrossCorrelation";
import { PhaseLocking } from "@/components/demos/PhaseLocking";
import { NonlinearDependence } from "@/components/demos/NonlinearDependence";
import { ComplexityMatching } from "@/components/demos/ComplexityMatching";
import { SurrogateTest } from "@/components/demos/SurrogateTest";

export const metadata: Metadata = {
	title: "Learn — Attuning to Nature",
	description:
		"The fundamental principles behind measuring whether two things are coupled: choosing an observable, the four families of coupling, and how to tell a real relationship from an accident.",
};

const SECTIONS = [
	{ id: "question", label: "The question" },
	{ id: "observable", label: "Choosing an observable" },
	{ id: "design-space", label: "The design space" },
	{ id: "linear", label: "Linear" },
	{ id: "oscillatory", label: "Oscillatory" },
	{ id: "information", label: "Information" },
	{ id: "complexity", label: "Complexity" },
	{ id: "surrogates", label: "Is it real?" },
	{ id: "choosing", label: "Choosing among them" },
];

function H2({ id, eyebrow, children }: { id: string; eyebrow?: string; children: React.ReactNode }) {
	return (
		<>
			{eyebrow && (
				<p className="font-sans text-[10px] uppercase tracking-[0.22em] text-muted">{eyebrow}</p>
			)}
			<h2 id={id} className="mt-2 scroll-mt-8 text-2xl leading-snug md:text-3xl">
				{children}
			</h2>
		</>
	);
}

export default function LearnPage() {
	return (
		<article className="mx-auto w-full max-w-3xl px-6 py-16 font-serif">
			<p className="font-sans text-xs uppercase tracking-[0.22em] text-muted">Section 2</p>
			<h1 className="mt-3 text-4xl leading-tight md:text-5xl">
				How to measure an attunement
			</h1>
			<p className="mt-6 text-lg leading-relaxed text-foreground/85">
				Two things unfold in time — a tide and a breath, a birdsong and a heartbeat, a
				forest canopy shifting in wind and the eyes moving across it — and you want to
				know whether they are related. That question sounds simple and is not, because
				&ldquo;related&rdquo; turns out to mean at least four different things, and the
				instrument you reach for decides which of them you can see.
			</p>
			<p className="mt-4 text-lg leading-relaxed text-foreground/85">
				This page is about those instruments and what each one is actually asking. Every
				figure computes what it claims to compute — real transforms on real synthetic
				signals — so you can move a control and watch the answer change rather than take
				a diagram&rsquo;s word for it.
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

			{/* ------------------------------------------------------------ question */}
			<section className="mt-14">
				<H2 id="question" eyebrow="The problem">
					Two signals, and no obvious way to compare them
				</H2>
				<p className="mt-5 text-lg leading-relaxed text-foreground/85">
					Put any two recordings side by side and, usually, nothing lines up. If you
					simply correlate them you will get a number near zero, and that number will
					be honest and useless — because you have asked whether they rise and fall{" "}
					<em>together</em>, when the interesting relationships in living systems are
					almost never that.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					One thing might track another after a delay. It might keep time with its
					rhythm while staying a quarter-cycle behind. It might respond non-linearly,
					so that a perfectly real dependence averages out to nothing. Or it might not
					agree in timing at all, and instead share the <em>texture</em> of its
					variability. Each of those is a different question about the same pair of
					signals, and each needs its own instrument. That is why what follows has four
					families rather than one measure.
				</p>
			</section>

			{/* ---------------------------------------------------------- observable */}
			<section className="mt-14">
				<H2 id="observable" eyebrow="First principle">
					Before you compare anything, decide what you are comparing
				</H2>
				<p className="mt-5 text-lg leading-relaxed text-foreground/85">
					Almost every signal worth studying is really two signals stacked on each
					other: something fast, and a slower shape riding on top of it. A voice has a
					pitch and a cadence. A flame has a flicker and a guttering. Footsteps have an
					impact and a gait. And very often the slow shape is the one that carries the
					relationship you are hunting, while the fast one is the carrier it happens to
					be written on.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					So the first move is not a comparison at all. It is a choice of observable:
					throw away the carrier and keep its <em>envelope</em> — how much is happening,
					moment to moment — extracted here with a Hilbert transform.
				</p>
				<EnvelopeExtraction />
				<p className="mt-1 text-lg leading-relaxed text-foreground/85">
					This choice is doing more work than it appears to. It is what makes
					unlike things comparable in the first place: a sound and a movement and a
					physiological rhythm all become slow one-dimensional traces of the same kind,
					sampled at the same rate. Every method below operates on traces of exactly
					that shape, and none of them knows or cares what they were made from. The
					swell of waves is one example of such a rhythm; it is not a privileged one.
				</p>
			</section>

			{/* -------------------------------------------------------- design space */}
			<section className="mt-14">
				<H2 id="design-space" eyebrow="The map">
					Every analysis is a feature crossed with a comparison
				</H2>
				<p className="mt-5 text-lg leading-relaxed text-foreground/85">
					Coupling methods proliferate, and their names make them sound like a zoo of
					unrelated techniques. They are not. Each one is a choice of{" "}
					<em>what to compare</em> — the raw trace, an oscillatory feature, a complexity
					feature — crossed with a choice of <em>how to compare it</em>. Laying them on
					that grid collapses the zoo into something you can hold in your head, and
					makes two formidable-sounding methods reveal themselves as combinations you
					already understand.
				</p>
				<CouplingDesignSpace />
			</section>

			{/* -------------------------------------------------------------- linear */}
			<section className="mt-14">
				<H2 id="linear" eyebrow="Family one">
					Linear — do they rise and fall together, allowing for a delay?
				</H2>
				<p className="mt-5 text-lg leading-relaxed text-foreground/85">
					The simplest question, and the one worth asking first. Its only real subtlety
					is the delay: effects take time to travel, so a correlation computed where two
					signals happen to sit will understate a real relationship badly. Slide one past
					the other, take the peak, and report both the strength and the lag at which it
					occurred — the lag is often the more interesting of the two, because it is a
					claim about mechanism rather than magnitude.
				</p>
				<LaggedCrossCorrelation />
			</section>

			{/* --------------------------------------------------------- oscillatory */}
			<section className="mt-14">
				<H2 id="oscillatory" eyebrow="Family two">
					Oscillatory — is the phase relationship stable?
				</H2>
				<p className="mt-5 text-lg leading-relaxed text-foreground/85">
					Entrainment is not really about amplitudes agreeing. It is about a{" "}
					<em>constant</em> relationship in phase — one thing keeping time with another,
					whatever the offset between them happens to be. Phase-locking value asks that
					and nothing else: is the phase difference the same now as it was a moment ago?
				</p>
				<PhaseLocking />
				<p className="mt-1 text-lg leading-relaxed text-foreground/85">
					Coherence asks a stricter version of the same question, requiring phase{" "}
					<em>and</em> amplitude to agree together. That strictness is a real choice with
					real costs: on signals whose loudness wanders — which is most natural ones —
					it will refuse to see relationships that a phase-only measure finds easily.
					Matching the estimator to the kind of regularity a signal actually has is not
					a technicality. It is most of the analysis.
				</p>
			</section>

			{/* --------------------------------------------------------- information */}
			<section className="mt-14">
				<H2 id="information" eyebrow="Family three">
					Information — is there any dependence at all, and which way does it run?
				</H2>
				<p className="mt-5 text-lg leading-relaxed text-foreground/85">
					A correlation of zero means &ldquo;no <em>linear</em> relationship&rdquo;. It
					does not mean the two are unrelated, and reading it that way discards every
					relationship that bends. Mutual information asks the general question instead:
					does knowing one of these reduce my uncertainty about the other, by any route
					at all?
				</p>
				<NonlinearDependence />
				<p className="mt-1 text-lg leading-relaxed text-foreground/85">
					The generality costs something. Mutual information has no sign, so it cannot
					tell you that more of one meant less of the other; it is hungrier for data;
					and — as the &ldquo;independent&rdquo; case above quietly shows — it reports
					dependence that is not there whenever signals are smooth. Granger causality
					and transfer entropy belong to this same family and add a direction, asking
					whether one signal&rsquo;s past improves prediction of the other&rsquo;s
					future.
				</p>
			</section>

			{/* ---------------------------------------------------------- complexity */}
			<section className="mt-14">
				<H2 id="complexity" eyebrow="Family four">
					Complexity — do they share a way of varying?
				</H2>
				<p className="mt-5 text-lg leading-relaxed text-foreground/85">
					The strangest family, and the one that best fits what attunement between a
					body and a place might actually be. Two things can be deeply related without
					ever lining up in time. What they share instead is the{" "}
					<em>statistical structure</em> of their fluctuations — how variability at fine
					scales relates to variability at coarse ones.
				</p>
				<ComplexityMatching />
			</section>

			{/* ---------------------------------------------------------- surrogates */}
			<section className="mt-14">
				<H2 id="surrogates" eyebrow="The check">
					A coupling number means nothing until you know what nothing looks like
				</H2>
				<p className="mt-5 text-lg leading-relaxed text-foreground/85">
					Every estimator above returns a number, and every one of them returns a
					number greater than zero even when there is nothing there. Smooth signals
					correlate with each other by accident. Autocorrelated signals manufacture
					mutual information out of nothing at all. Sample sizes that look generous are
					not, once you notice that a slow signal contains far fewer independent
					observations than it does samples.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					The only defence is to build a null on purpose: destroy the relationship while
					keeping everything else about the signals intact — same spectrum, same
					autocorrelation, same distribution — measure again, and repeat until you know
					the shape of nothing. Then ask where your real number falls in it.
				</p>
				<SurrogateTest />
			</section>

			{/* ------------------------------------------------------------ choosing */}
			<section className="mt-14">
				<H2 id="choosing" eyebrow="The principle underneath">
					No measure is best; each one is a question
				</H2>
				<p className="mt-5 text-lg leading-relaxed text-foreground/85">
					It is tempting to look for the most sensitive method and use it everywhere.
					That instinct is wrong, and the four demos above show why. Construct a pair of
					signals coupled purely in phase and the linear measure reports nothing.
					Construct a pair coupled through a fold or a square and the phase measure
					reports nothing. Match two signals in scaling alone and every timing-based
					measure on the page returns zero, correctly, because there is no timing
					relationship to find.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					Each estimator is not a better or worse detector of one underlying thing
					called coupling. Each is a specific question, answered honestly. Which means
					the real work happens before any of them runs — in deciding what kind of
					relationship you think is there, and therefore what would count as evidence
					of it. A method chosen after seeing the data is not a measurement; it is a
					preference.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					That is also the honest reason to show all four rather than name a favourite.
					Attunement between a living thing and its surroundings almost certainly is not
					one phenomenon. A body may track a rhythm in one respect, ignore it in
					another, and share a texture with it in a third — all at once, and all real.
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
