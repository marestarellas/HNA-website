import type { Metadata } from "next";
import { SpectrumAnatomy } from "@/components/demos/SpectrumAnatomy";
import { SameBandPower } from "@/components/demos/SameBandPower";
import { ExponentOverTime } from "@/components/demos/ExponentOverTime";
import { Part, Step, Asks, KeyIdea, BlindSpot } from "@/components/demos/_didactic";

export const metadata: Metadata = {
	title: "The shape of a spectrum · Attuning to Nature",
	description:
		"Why alpha power going up does not mean the alpha rhythm got stronger: separating the aperiodic background of a spectrum from the oscillatory peaks on top of it.",
};

const PARTS = [
	{
		label: "Part one",
		title: "What a spectrum is made of",
		sections: [
			{ id: "anatomy", label: "01 · A line, plus bumps" },
			{ id: "ambiguity", label: "02 · The ambiguity" },
		],
	},
	{
		label: "Part two",
		title: "What the background is",
		sections: [
			{ id: "background", label: "03 · Not noise" },
			{ id: "trace", label: "04 · A slope that moves" },
		],
	},
];

export default function SpectrumPage() {
	return (
		<article className="mx-auto w-full max-w-3xl px-6 py-16 font-serif">
			<p className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
				Learn · Three
			</p>
			<h1 className="mt-3 text-4xl leading-tight md:text-5xl">
				The shape of a spectrum
			</h1>
			<p className="mt-6 text-xl leading-relaxed text-foreground/85">
				Alpha power went up. It is one of the most reported findings in the whole of
				human neuroscience, and on its own it does not say what happened.
			</p>
			<p className="mt-4 text-lg leading-relaxed text-foreground/85">
				There are two ways for the power in a band to increase, and they mean
				different things about a brain. Telling them apart takes one extra step that
				is easy to describe and was skipped for decades. This page is that step.
			</p>

			<nav aria-label="Contents" className="mt-10 border-y border-rule py-5">
				<div className="grid gap-6 sm:grid-cols-2">
					{PARTS.map((p) => (
						<div key={p.label}>
							<p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
								{p.label}
							</p>
							<p className="mt-1 font-serif text-base leading-snug text-foreground">
								{p.title}
							</p>
							<ul className="mt-2 space-y-1">
								{p.sections.map((s) => (
									<li key={s.id}>
										<a
											href={`#${s.id}`}
											className="font-sans text-[11px] uppercase tracking-[0.12em] text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
										>
											{s.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</nav>

			{/* ===================================================== PART ONE ===== */}
			<Part
				n={1}
				label="Part one"
				title="What a spectrum is made of"
				blurb="Two things, added together, that are usually treated as one. Separating them takes a model, and the model is simpler than the confusion it removes."
			/>

			<section>
				<Step
					n={1}
					id="anatomy"
					eyebrow="The model"
					title="A straight line, with bumps on it"
				/>
				<p className="text-lg leading-relaxed text-foreground/85">
					Plot the power spectrum of almost any physiological recording on
					logarithmic axes and the first thing you see is a downward slope. Low
					frequencies carry more power than high ones, smoothly, across the whole
					range. That slope is present whether or not anything is rhythmic, and it is
					the same scale-free structure that turns up in natural images and natural
					sound.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					Sitting on top of it, where a genuine rhythm exists, are bumps. A model of
					the spectrum is therefore two things added together: an aperiodic
					background, described by an offset and a slope, and some number of periodic
					peaks, each with a centre frequency, a height and a width.
				</p>
				<SpectrumAnatomy />
				<KeyIdea>
					The background is not a nuisance to be subtracted before the interesting
					part. It is one of the two things a spectrum is made of.
				</KeyIdea>
			</section>

			<section className="mt-16">
				<Step
					n={2}
					id="ambiguity"
					eyebrow="Why it matters"
					title="Two ways to make a band get bigger"
				/>
				<Asks>Did the rhythm change, or did the background move underneath it?</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					Band power is an integral. Add up the power between 8 and 12 Hz and you get
					a number, and that number rises if the alpha peak grows taller. It also
					rises if the peak does not move at all and the background tilts. The
					integral cannot distinguish the two, because it was never asked to.
				</p>
				<SameBandPower />
				<BlindSpot>
					cause. Band power is a good description of how much energy sits inside a
					window, and it says nothing about where that energy came from.
				</BlindSpot>
				<KeyIdea>
					A result reported as a change in band power is compatible with two different
					stories, and the analysis that produced it usually cannot say which one it
					found.
				</KeyIdea>
			</section>

			{/* ===================================================== PART TWO ===== */}
			<Part
				n={2}
				label="Part two"
				title="What the background is"
				blurb="Having separated it, the slope turns out to be worth measuring in its own right, and to move on timescales that make it something you can couple on."
			/>

			<section>
				<Step
					n={3}
					id="background"
					eyebrow="The aperiodic component"
					title="The slope is a finding, not a leftover"
				/>
				<p className="text-lg leading-relaxed text-foreground/85">
					For a long time the background was treated as the boring part: whatever is
					left once the peaks have been taken out, a kind of measurement noise to be
					normalised away. It is not noise. It varies systematically with age, with
					arousal, with state of consciousness, and it has been argued to track the
					balance between excitation and inhibition in the underlying population.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					Which makes the confusion in the previous section more serious than a
					methodological quibble. Two studies could report the same change in band
					power, with one having found a rhythm and the other having found a change in
					background state, and nothing in either paper would say so.
				</p>
				<KeyIdea>
					Everything a spectrum contains that is not a rhythm is still something. Give
					it a parameter and it stops being a residual and starts being a measurement.
				</KeyIdea>
			</section>

			<section className="mt-16">
				<Step
					n={4}
					id="trace"
					eyebrow="Back to coupling"
					title="A slope that moves is a signal"
				/>
				<p className="text-lg leading-relaxed text-foreground/85">
					One exponent per recording is a summary. Fit it inside a sliding window and
					it becomes a trace, one value per moment, of exactly the kind everything
					else on this site consumes. At that point the question stops being what a
					person&rsquo;s exponent is and starts being whether it moves with something
					in the world.
				</p>
				<ExponentOverTime />
				<KeyIdea>
					This is the same promotion the complexity measures get: from a number that
					describes a recording to a number that varies within one. Only the second
					kind can be coupled to anything.
				</KeyIdea>
			</section>

			<section className="mt-20 border-t border-rule pt-8">
				<p className="font-sans text-xs leading-relaxed text-muted">
					The fitting here follows the standard approach: fit the background robustly
					so that peaks do not drag the slope upward, extract peaks from what is left,
					then refit the background with the peaks removed. It is simplified against a
					research implementation, which optimises all the peak parameters jointly
					rather than estimating each from its own neighbourhood. It was checked
					against known inputs first: with no peaks present the exponent comes back
					exactly, and with an alpha peak added it comes back within about a
					hundredth. Still to be written: the knee, which matters whenever the fitting
					range is wide enough for the slope to bend, and what changes when the same
					fit is applied across many channels at once.
				</p>
			</section>
		</article>
	);
}
