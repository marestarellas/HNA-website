import type { Metadata } from "next";
import { SpatialReduction } from "@/components/demos/SpatialReduction";
import { VideoFeatures } from "@/components/demos/VideoFeatures";
import { TimestackFigure } from "@/components/demos/TimestackFigure";
import { SpatialFrequency } from "@/components/demos/SpatialFrequency";
import { ModalDecomposition } from "@/components/demos/ModalDecomposition";
import { ModeGallery } from "@/components/demos/ModeGallery";
import { RealSignals } from "@/components/demos/RealSignals";
import { FourSeas } from "@/components/demos/FourSeas";
import { VideoDesignSpace } from "@/components/demos/VideoDesignSpace";
import { Part, Step, Asks, KeyIdea, BlindSpot } from "@/components/demos/_didactic";

export const metadata: Metadata = {
	title: "Quantifying oscillations · Attuning to Nature",
	description:
		"How a coastline becomes a number that changes over time: spatial scale, timestacks, spatial frequency and scale-free structure, and modal decomposition.",
};

const PARTS = [
	{
		label: "Part one",
		title: "A scene is not a signal",
		sections: [
			{ id: "reduction", label: "01 · The reduction" },
			{ id: "footage", label: "02 · Real footage" },
		],
	},
	{
		label: "Part two",
		title: "Reading rhythm out of a scene",
		sections: [
			{ id: "timestack", label: "03 · Timestacks" },
			{ id: "spectrum", label: "04 · Scale-free structure" },
			{ id: "modes", label: "05 · Modes" },
			{ id: "four-seas", label: "06 · Four seas" },
		],
	},
	{
		label: "Part three",
		title: "The whole space",
		sections: [{ id: "matrix", label: "07 · The video matrix" }],
	},
];

export default function OscillationsPage() {
	return (
		<article className="mx-auto w-full max-w-3xl px-6 py-16 font-serif">
			<p className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
				Learn · Two
			</p>
			<h1 className="mt-3 text-4xl leading-tight md:text-5xl">
				Quantifying oscillations in natural images and sounds
			</h1>
			<p className="mt-6 text-xl leading-relaxed text-foreground/85">
				A coastline is not a signal. It is light arriving at a sensor, indexed by two
				spatial dimensions and one temporal one, and none of that can be set beside a
				heartbeat until it has become a single number that changes over time.
			</p>
			<p className="mt-4 text-lg leading-relaxed text-foreground/85">
				That reduction is a choice, and there are many honest ways to make it. This
				page walks through the main ones and shows what each keeps and what each
				throws away. Some figures use real footage with the measures computed live
				from its pixels; others use synthesised scenes, because the only way to prove
				a method works is to hand it data whose answer you already know.
			</p>

			<nav aria-label="Contents" className="mt-10 border-y border-rule py-5">
				<div className="grid gap-6 sm:grid-cols-3">
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
				title="A scene is not a signal"
				blurb="Three dimensions have to become one. What that costs, and why the answer depends on how much of the frame each number is asked to stand for."
			/>

			<section>
				<Step
					n={1}
					id="reduction"
					eyebrow="The problem"
					title="How much of the frame should one number mean?"
				/>
				<p className="text-lg leading-relaxed text-foreground/85">
					Every measure on this page begins by collapsing a frame to fewer numbers than
					it contains. The question is how far to collapse it. Average the whole image
					and you get one value that is cheap, stable and often nearly blind. Keep every
					pixel separately and you get a map that is precise, expensive and fragile.
					Between them sits a grid of patches, which is where a great deal of practical
					work actually lives.
				</p>
				<SpatialReduction />
				<BlindSpot>
					anything the reduction averages away. A whole-image mean cannot see where in
					the frame something happened, and by construction it barely sees a travelling
					wave at all.
				</BlindSpot>
				<KeyIdea>
					The spatial scale is not a technical setting. It decides which questions the
					rest of the analysis is even able to ask.
				</KeyIdea>
			</section>

			<section className="mt-16">
				<Step
					n={2}
					id="footage"
					eyebrow="The same thing on real video"
					title="Three seas, one set of measures"
				/>
				<p className="text-lg leading-relaxed text-foreground/85">
					Synthetic scenes are useful because you know the answer in advance. Real
					footage is useful because it does not cooperate. Below are three clips of
					moving water, with the measures computed in the browser frame by frame as
					the video plays.
				</p>
				<p className="mt-4 text-lg leading-relaxed text-foreground/85">
					Switch between the clips with the same view selected and watch the numbers
					move. A long breaking swell and a short choppy surface are obviously
					different to look at, and the point is that they are also different in a way
					a measure can report without anybody describing the scene to it.
				</p>
				<VideoFeatures />
				<KeyIdea>
					These measures never learn what water is. They report how brightness is
					distributed and how it changes, and the difference between a swell and a chop
					falls out of that on its own.
				</KeyIdea>

				<p className="mt-10 text-lg leading-relaxed text-foreground/85">
					Browser arithmetic is necessarily crude. The traces below come from the
					project&rsquo;s analysis pipeline instead, which uses dense optical flow and
					proper complexity estimators. Same footage, better instruments.
				</p>
				<RealSignals />
				<KeyIdea>
					Direction entropy is the one to notice. Two clips can carry identical average
					motion and still be told apart by whether the frame agrees about which way it
					is going.
				</KeyIdea>
			</section>

			{/* ===================================================== PART TWO ===== */}
			<Part
				n={2}
				label="Part two"
				title="Reading rhythm out of a scene"
				blurb="Three ways to get a frequency out of moving pixels: sample one line and read time as an image, measure how power spreads across scales, or decompose the motion into oscillating patterns."
			/>

			<section>
				<Step
					n={3}
					id="timestack"
					eyebrow="The oceanographer's trick"
					title="Timestacks: one column, read as an image of time"
				/>
				<Asks>How long does a wave take to pass a fixed line?</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					Take a single column of pixels and record it at every frame, then lay those
					columns side by side. Space runs down the result and time runs across it, so
					a wave moving past the column draws a diagonal stripe, and the spacing
					between stripes is the wave period. It is an unreasonably economical method:
					one line out of a whole scene, and the number falls out.
				</p>
				<TimestackFigure />
				<BlindSpot>
					anything that does not cross the sampled line coherently. Short-crested chop
					never builds a stripe, which is a weakness if the chop is what you care about
					and a strength if it is not.
				</BlindSpot>
				<KeyIdea>
					Discarding almost the entire frame can make a measurement more robust rather
					than less. What matters is whether what you kept carries the structure you
					are asking about.
				</KeyIdea>
			</section>

			<section className="mt-16">
				<Step
					n={4}
					id="spectrum"
					eyebrow="Structure across scales"
					title="Scale-free, in space and in time"
				/>
				<Asks>Is any scale privileged, or is structure spread evenly across all of them?</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					Natural scenes have a statistical signature that has nothing to do with what
					is in them. Take the two-dimensional spectrum of almost any photograph of a
					landscape and power falls off as roughly one over spatial frequency squared,
					which is to say structure exists at every size with none dominating. The same
					is true along the time axis of a great many natural sounds.
				</p>
				<SpatialFrequency />
				<BlindSpot>
					arrangement. A slope says how power is spread across scales and nothing about
					where anything is, so a landscape and a shuffled version of that landscape can
					score identically.
				</BlindSpot>
				<KeyIdea>
					An image and a sound are the same kind of object one axis apart, which is
					why the same handful of operations serves both.
				</KeyIdea>
			</section>

			<section className="mt-16">
				<Step
					n={5}
					id="modes"
					eyebrow="Decomposition"
					title="A scene as a few oscillating patterns"
				/>
				<Asks>Can the motion be written as a small number of fixed patterns taking turns?</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					Often it can. Rather than a frequency per pixel or one number for the whole
					frame, look for the handful of spatial patterns whose brightnesses oscillate,
					and describe the clip as their sum. A long video becomes a few images and a
					few traces, with very little worth worrying about lost.
				</p>
				<ModalDecomposition />
				<BlindSpot>
					anything that is not a sum of steady patterns. A scene whose structure changes
					partway through needs the decomposition refitted in a sliding window, or it
					will average the two regimes into something that describes neither.
				</BlindSpot>
				<KeyIdea>
					Modes arrive in pairs because a standing pattern cannot travel. Reading a
					decomposition means reading the pairs, not the individual modes.
				</KeyIdea>

				<p className="mt-10 text-lg leading-relaxed text-foreground/85">
					Those were synthesised, so the answer was known in advance. Below are modes
					decomposed from footage, drawn as reliefs that oscillate at the frequencies
					the pipeline found for them.
				</p>
				<ModeGallery />
			</section>

			<section className="mt-16">
				<Step
					n={6}
					id="four-seas"
					eyebrow="Putting it together"
					title="Four seas, told apart by numbers alone"
				/>
				<Asks>
					Can measures that know nothing about water sort these clips the way a person
					would?
				</Asks>
				<p className="text-lg leading-relaxed text-foreground/85">
					Four clips of moving water, each run through the whole pipeline. None of
					these measures has any concept of a wave, a horizon or foam. They report how
					brightness is arranged, how it moves and how regular that movement is, and
					that turns out to be enough to separate an ordered swell from a broken sea.
				</p>
				<FourSeas />
				<BlindSpot>
					meaning. These numbers separate the clips reliably and say nothing whatever
					about which sea a person would rather sit beside, which is a different
					question and needs a different instrument.
				</BlindSpot>
				<KeyIdea>
					A measurement that agrees with your eye on cases you can check is a
					measurement you can begin to trust on cases you cannot.
				</KeyIdea>
			</section>

			{/* =================================================== PART THREE ===== */}
			<Part
				n={3}
				label="Part three"
				title="The whole space"
				blurb="Two decisions, crossed. One of them is new; the other you have met before."
			/>

			<section>
				<Step
					n={7}
					id="matrix"
					eyebrow="Zooming out"
					title="Spatial scale crossed with feature family"
				/>
				<p className="text-lg leading-relaxed text-foreground/85">
					Every extractor on this page is a choice of how much of the frame one number
					stands for, crossed with a choice of what about it to measure. The first
					decision is particular to images. The second is not: the columns below are
					the same three feature families that organise every coupling method, because
					once a scene has been reduced to a trace it stops mattering that it came from
					a camera.
				</p>
				<VideoDesignSpace />
				<KeyIdea>
					A video is not a special kind of data. It is an expensive way to arrive at
					the same one-dimensional traces everything else produces, and the expense
					buys you a choice about spatial scale that a microphone never offers.
				</KeyIdea>
			</section>

			<section className="mt-20 border-t border-rule pt-8">
				<p className="font-sans text-xs leading-relaxed text-muted">
					Where a figure synthesises a scene it also checks itself: the spectral slope
					recovers the value it was given to within a hundredth, and the timestack
					recovers a swell frequency to within half a bin even under heavy chop. The
					figures that sample video reduce frames on a small grid in the browser, which
					is coarser than the offline pipeline and behaves the same way. Still to be
					written: optical flow in its own right, per-pixel frequency maps, and what
					changes when the camera is moving too.
				</p>
			</section>
		</article>
	);
}
