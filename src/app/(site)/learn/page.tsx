import type { Metadata } from "next";
import { TopicCard, type TopicStatus } from "@/components/learn/TopicCard";
import {
	AttunementMark,
	OscillationsMark,
	PhenomenologyMark,
	ConnectednessMark,
} from "@/components/learn/TopicMarks";

export const metadata: Metadata = {
	title: "Learn · Attuning to Nature",
	description:
		"Four ways into the project's ideas: how coupling between a body and its surroundings is measured, how oscillation and structure are quantified in natural images and sounds, how felt experience is turned into data, and what nature connectedness means.",
};

const TOPICS: {
	href?: string;
	eyebrow: string;
	title: string;
	blurb: string;
	covers: string[];
	status: TopicStatus;
	accent: string;
	mark: React.ReactNode;
}[] = [
	{
		href: "/learn/attunement",
		eyebrow: "One",
		title: "Attunement",
		blurb:
			"Two things unfold in time and you want to know whether they are related. That question turns out to mean at least four different things, and the instrument you reach for decides which of them you can see.",
		covers: [
			"Choosing an observable",
			"Four families of coupling",
			"Surrogate tests",
			"Nine live figures",
		],
		status: "ready",
		accent: "--fam-linear",
		mark: <AttunementMark />,
	},
	{
		href: "/learn/oscillations",
		eyebrow: "Two",
		title: "Quantifying oscillations in natural images and sounds",
		blurb:
			"A coastline is not a signal. Before anything can be measured against a heartbeat, a scene has to become a number that changes over time, and there are many honest ways to do that reduction.",
		covers: [
			"Spatial scale",
			"Real footage, measured live",
			"Timestacks",
			"Scale-free structure",
		],
		status: "ready",
		accent: "--fam-complexity",
		mark: <OscillationsMark />,
	},
	{
		eyebrow: "Three",
		title: "Measuring phenomenology",
		blurb:
			"How something felt is not directly observable, and asking about it changes it. What a self-report can and cannot carry, and how to build an instrument that respects the difference.",
		covers: [
			"Scales and differentials",
			"Vividness and time depth",
			"What reports miss",
		],
		status: "planned",
		accent: "--fam-information",
		mark: <PhenomenologyMark />,
	},
	{
		eyebrow: "Four",
		title: "Nature connectedness",
		blurb:
			"A research literature with its own instruments, its own disagreements, and a habit of measuring several different things under one name. What the construct claims, and where it is contested.",
		covers: ["The main scales", "State versus trait", "Open questions"],
		status: "planned",
		accent: "--fam-oscillatory",
		mark: <ConnectednessMark />,
	},
];

export default function LearnIndexPage() {
	return (
		<article className="mx-auto w-full max-w-4xl px-6 py-16">
			<p className="font-sans text-xs uppercase tracking-[0.22em] text-muted">Section 2</p>
			<h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">Learn</h1>
			<p className="mt-6 max-w-2xl font-serif text-xl leading-relaxed text-foreground/85">
				Four ways into the ideas behind this project. Each is written to stand on its
				own, and each is built around figures you can move rather than diagrams you
				have to take on trust.
			</p>
			<p className="mt-4 max-w-2xl font-serif text-lg leading-relaxed text-foreground/85">
				They are meant to be read in any order, though the first two share a
				vocabulary: what you choose to measure, and how you compare two measurements.
			</p>

			<div className="mt-12 grid gap-5 md:grid-cols-2">
				{TOPICS.map((t) => (
					<TopicCard key={t.title} {...t} />
				))}
			</div>

			<p className="mt-12 border-t border-rule pt-6 font-sans text-xs leading-relaxed text-muted">
				Two of these are still to be written. They are listed rather than hidden
				because the shape of what is coming is useful in itself, and because a section
				that looks finished when it is not is worse than one that is honest about
				where it stands.
			</p>
		</article>
	);
}
