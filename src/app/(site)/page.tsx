import Link from "next/link";

const SECTIONS = [
	{
		href: "/learn",
		eyebrow: "Section 2",
		title: "Learn",
		blurb:
			"What entrainment is. What it means for a brain to lock onto a wave, a forest, a breath. Short animations and live demos for each concept.",
	},
	{
		href: "/stories",
		eyebrow: "Section 3",
		title: "Stories, Myths, and People (and Animals) of the Land",
		blurb:
			"A world map of stories shared by visitors — personal experiences and inherited folklore of places, organisms, elements, and times. The heart of the site.",
	},
	{
		href: "/experiment",
		eyebrow: "Section 4",
		title: "Experiment",
		blurb:
			"A short sequence of generated nature stimuli, with a brief phenomenological self-report after each. A research instrument disguised as an experience.",
	},
	{
		href: "/science",
		eyebrow: "Section 1",
		title: "Science",
		blurb:
			"The empirical study behind the project — methods, figures, what we are finding. Honest about being in progress.",
	},
];

export default function Home() {
	return (
		<main className="mx-auto w-full max-w-3xl px-6 py-16 font-serif">
			<section>
				<h1 className="text-4xl leading-tight md:text-5xl">
					A scientific and artistic project on how humans attune to,
					and become coupled with, their environments.
				</h1>
				<p className="mt-6 font-sans text-base leading-relaxed text-muted">
					Bringing together neuroscience, phenomenology, computer
					science, and storytelling around a single question: how do
					bodies fall into rhythm with the places they live in?
				</p>
			</section>

			<section className="mt-16 border-t border-rule pt-8">
				<h2 className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
					Four entrances
				</h2>
				<ul className="mt-6 divide-y divide-rule">
					{SECTIONS.map((s) => (
						<li key={s.href}>
							<Link
								href={s.href}
								className="group block py-6 transition-colors hover:bg-foreground/[0.03]"
							>
								<div className="flex items-baseline justify-between gap-6">
									<span className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
										{s.eyebrow}
									</span>
									<span className="font-sans text-xs uppercase tracking-[0.22em] text-muted opacity-0 transition-opacity group-hover:opacity-100">
										enter →
									</span>
								</div>
								<h3 className="mt-2 text-2xl leading-tight">{s.title}</h3>
								<p className="mt-2 font-sans text-sm leading-relaxed text-foreground/75">
									{s.blurb}
								</p>
							</Link>
						</li>
					))}
				</ul>
			</section>

			<p className="mt-16 font-sans text-xs uppercase tracking-[0.22em] text-muted">
				Bootstrap skeleton — design direction not yet chosen
			</p>
		</main>
	);
}
