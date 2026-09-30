import Link from "next/link";

/**
 * The landing page, as an interim.
 *
 * A visual direction for the site has not been chosen yet; five explorations
 * live under /design and one of them will eventually set the whole thing. Until
 * that decision is made this page has to do a plain job well: say what the
 * project is, look like someone cared, and get a reader into one of the four
 * sections. It borrows nothing from the explorations, so picking one later
 * means replacing this outright rather than untangling it.
 *
 * The four entrances carry the same colours the Learn section assigns to the
 * four families of coupling measure. That is not decoration: a reader who picks
 * the mapping up here keeps reading it correctly later.
 */

const SECTIONS = [
	{
		href: "/science",
		numeral: "I",
		title: "Science",
		blurb:
			"The empirical study behind the project: methods, figures, what we are finding. Honest about being in progress.",
		accent: "--fam-linear",
	},
	{
		href: "/learn",
		numeral: "II",
		title: "Learn",
		blurb:
			"What entrainment is. What it means for a brain to lock onto a wave, a forest, a breath. Short animations and live demos for each concept.",
		accent: "--fam-oscillatory",
	},
	{
		href: "/stories",
		numeral: "III",
		title: "Stories, Myths, and People (and Animals) of the Land",
		blurb:
			"A world map of stories shared by visitors: personal experiences and inherited folklore of places, organisms, elements, and times. The heart of the site.",
		accent: "--fam-information",
	},
	{
		href: "/experiment",
		numeral: "IV",
		title: "Experiment",
		blurb:
			"A short sequence of generated nature stimuli, with a brief phenomenological self-report after each. A research instrument disguised as an experience.",
		accent: "--fam-complexity",
	},
];

export default function Home() {
	return (
		<main>
			{/* ------------------------------------------------------------ hero */}
			<section className="relative isolate overflow-hidden">
				<div className="relative h-[min(80vh,680px)] w-full">
					{/*
					  A plain <img> rather than next/image. The banner is a single 49KB
					  asset served from the Worker's own static assets, so there is
					  nothing for an optimiser to win, and it should paint immediately
					  rather than be swapped in afterwards.
					*/}
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/banner/biosignal-score.jpg"
						alt="A luminous trace rising out of a dark sea, drawn the way a physiological signal is drawn: a bright line following the water, spiking where the wave breaks."
						width={1344}
						height={896}
						fetchPriority="high"
						className="absolute inset-0 h-full w-full object-cover"
						style={{ objectPosition: "50% 54%" }}
					/>

					{/* Legibility, and only as much as the type needs. The band of light
					    across the middle is the reason to look at this at all, so the
					    scrim is heaviest at the very top and the very bottom and gets
					    out of the way in between. */}
					<div
						aria-hidden
						className="absolute inset-0"
						style={{
							background:
								"linear-gradient(to bottom, rgba(2,16,18,0.60) 0%, rgba(2,16,18,0.10) 26%, rgba(2,16,18,0.18) 52%, rgba(2,16,18,0.72) 82%, rgba(2,16,18,0.92) 100%)",
						}}
					/>
					{/* The hero melts into the page rather than ending on a line. */}
					<div
						aria-hidden
						className="absolute inset-x-0 bottom-0 h-24"
						style={{
							background: "linear-gradient(to bottom, transparent, var(--background))",
						}}
					/>

					<div className="relative mx-auto flex h-full w-full max-w-5xl flex-col justify-end px-6 pb-28">
						<p className="font-sans text-[11px] uppercase tracking-[0.34em] text-[#8fd8d2]">
							attuning to nature
						</p>
						<h1 className="mt-5 max-w-3xl font-serif text-[clamp(30px,4.4vw,56px)] leading-[1.08] tracking-[-0.02em] text-[#f2ede1]">
							A scientific and artistic project on how humans attune to, and
							become coupled with, their environments.
						</h1>
						<p className="mt-6 max-w-xl font-sans text-[15px] leading-relaxed text-[#cfd8d4]">
							Bringing together neuroscience, phenomenology, computer science, and
							storytelling around a single question: how do bodies fall into
							rhythm with the places they live in?
						</p>
					</div>
				</div>
			</section>

			{/* ------------------------------------------------------- entrances */}
			<section className="mx-auto w-full max-w-5xl px-6 pb-20">
				<div className="flex items-baseline justify-between gap-6 border-b border-rule pb-4">
					<h2 className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
						Four entrances
					</h2>
					<p className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
						read in any order
					</p>
				</div>

				<ul className="mt-8 grid gap-4 md:grid-cols-2">
					{SECTIONS.map((s) => (
						<li key={s.href}>
							<Link
								href={s.href}
								className="group flex h-full flex-col rounded-sm border border-l-[3px] border-y-rule border-r-rule p-6 transition-colors hover:bg-foreground/[0.03] sm:p-7"
								style={{ borderLeftColor: `var(${s.accent})` }}
							>
								<div className="flex items-baseline justify-between gap-4">
									<span
										className="font-sans text-[11px] uppercase tracking-[0.28em]"
										style={{ color: `var(${s.accent})` }}
									>
										{s.numeral}
									</span>
									<span
										aria-hidden
										className="font-sans text-[10px] uppercase tracking-[0.22em] opacity-0 transition-opacity group-hover:opacity-100"
										style={{ color: `var(${s.accent})` }}
									>
										enter &rarr;
									</span>
								</div>
								<h3 className="mt-3 font-serif text-2xl leading-tight text-foreground">
									{s.title}
								</h3>
								<p className="mt-3 font-sans text-sm leading-relaxed text-foreground/75">
									{s.blurb}
								</p>
							</Link>
						</li>
					))}
				</ul>

				<p className="mt-10 border-t border-rule pt-6 font-sans text-xs leading-relaxed text-muted">
					The visual direction for the site is still being chosen. Five
					explorations of how it could look and feel live at{" "}
					<Link
						href="/design"
						className="underline underline-offset-4 transition-colors hover:text-foreground"
					>
						/design
					</Link>
					, and this page stands in until one of them is picked.
				</p>
			</section>
		</main>
	);
}
