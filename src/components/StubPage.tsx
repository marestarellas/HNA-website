import type { ReactNode } from "react";

// Skeleton container used by every section page until that section is built.
// Intentionally plain — it's a structural wireframe, not a design proposal.
type StubPageProps = {
	eyebrow: string;
	title: string;
	intro: string;
	willInclude: string[];
	children?: ReactNode;
};

export function StubPage({ eyebrow, title, intro, willInclude, children }: StubPageProps) {
	return (
		<article className="mx-auto w-full max-w-3xl px-6 py-16 font-serif">
			<p className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
				{eyebrow}
			</p>
			<h1 className="mt-3 text-4xl leading-tight md:text-5xl">{title}</h1>
			<p className="mt-6 text-lg leading-relaxed text-foreground/85">{intro}</p>

			<section className="mt-12 border-t border-rule pt-8">
				<h2 className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
					Will include
				</h2>
				<ul className="mt-4 space-y-2 font-sans text-sm leading-relaxed text-foreground/75">
					{willInclude.map((item) => (
						<li key={item} className="flex gap-3">
							<span aria-hidden className="text-muted">·</span>
							<span>{item}</span>
						</li>
					))}
				</ul>
			</section>

			{children && (
				<section className="mt-12 border-t border-rule pt-8">{children}</section>
			)}

			<p className="mt-16 font-sans text-xs uppercase tracking-[0.22em] text-muted">
				Not yet built — bootstrap skeleton
			</p>
		</article>
	);
}
