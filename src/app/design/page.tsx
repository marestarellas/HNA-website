import Link from "next/link";
import { DESIGNS } from "./_content";

// Index page for the five design directions. Lists each with its rationale
// and links into the full-page mock. Use this page to compare; click into a
// direction to see it inhabited.

export default function DesignIndexPage() {
	return (
		<main className="mx-auto w-full max-w-4xl px-6 py-16 font-serif">
			<header>
				<p className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
					Design system · five directions
				</p>
				<h1 className="mt-3 text-4xl leading-tight md:text-5xl">
					Five ways the site could feel
				</h1>
				<p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-foreground/85">
					Each direction below is a distinct visual treatment of the
					landing page — not a colorway of one design but a different
					premise about what kind of object this site is. Click in to
					inhabit one. The chrome at the top of each mock lets you
					flip between them.
				</p>
				<p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-muted">
					Same content in every mock so you compare presentation, not
					words. Imagery, where used, is currently placeholder color
					blocks since no photo bank exists yet.
				</p>
			</header>

			<section className="mt-12 divide-y divide-rule border-t border-rule">
				{DESIGNS.map((d) => (
					<Link
						key={d.slug}
						href={`/design/${d.slug}`}
						className="group block py-8 transition-colors hover:bg-foreground/[0.03]"
					>
						<div className="grid gap-6 md:grid-cols-[6rem_1fr_auto] md:gap-10">
							<div className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
								{d.number}
							</div>
							<div>
								<h2 className="text-2xl leading-tight">{d.name}</h2>
								<p className="mt-1 font-sans text-sm italic text-muted">
									{d.tagline}
								</p>
								<p className="mt-4 font-sans text-sm leading-relaxed text-foreground/80">
									{d.rationale}
								</p>
							</div>
							<div className="self-start font-sans text-xs uppercase tracking-[0.22em] text-muted opacity-0 transition-opacity group-hover:opacity-100">
								enter →
							</div>
						</div>
					</Link>
				))}
			</section>

			<footer className="mt-16 border-t border-rule pt-6 font-sans text-xs uppercase tracking-[0.22em] text-muted">
				Pick one, several, or none — happy to combine, mutate, or scrap
				any of these.
			</footer>
		</main>
	);
}
