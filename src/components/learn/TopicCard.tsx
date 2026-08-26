import Link from "next/link";
import type { ReactNode } from "react";

/**
 * One topic on the Learn index.
 *
 * Each card carries a drawn mark rather than an icon. The distinction matters
 * here: an icon labels a category, whereas these draw the thing the topic is
 * actually about (two rhythms locking, a wave field sampled down a column,
 * a felt scale, a self overlapping a world). A reader who has not yet clicked
 * should already have a picture of what is inside.
 *
 * Cards that are not built yet stay visible and stay honest about it. Hiding
 * them would make the section look finished when it is not, and the shape of
 * what is coming is itself useful to a reader deciding where to start.
 */

export type TopicStatus = "ready" | "next" | "planned";

const STATUS_LABEL: Record<TopicStatus, string> = {
	ready: "Read now",
	next: "In progress",
	planned: "Planned",
};

export function TopicCard({
	href,
	eyebrow,
	title,
	blurb,
	covers,
	status,
	accent,
	mark,
}: {
	href?: string;
	eyebrow: string;
	title: string;
	blurb: string;
	covers: string[];
	status: TopicStatus;
	/** CSS custom property name, e.g. "--fam-linear". */
	accent: string;
	mark: ReactNode;
}) {
	const ready = status === "ready" && href;

	const body = (
		<>
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<p
						className="font-sans text-[10px] uppercase tracking-[0.2em]"
						style={{ color: `var(${accent})` }}
					>
						{eyebrow}
					</p>
					<h2 className="mt-2 font-serif text-2xl leading-tight text-foreground">
						{title}
					</h2>
				</div>
				<div
					className="shrink-0 rounded-sm p-2"
					style={{ background: `color-mix(in oklab, var(${accent}) 8%, transparent)` }}
				>
					{mark}
				</div>
			</div>

			<p className="mt-3 font-serif text-[15px] leading-relaxed text-foreground/80">
				{blurb}
			</p>

			<ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
				{covers.map((c) => (
					<li key={c} className="flex items-center gap-1.5">
						<span
							aria-hidden
							className="block h-1 w-1 rounded-full"
							style={{ background: `var(${accent})` }}
						/>
						<span className="font-sans text-[11px] text-muted">{c}</span>
					</li>
				))}
			</ul>

			<p className="mt-5 flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.18em]">
				<span style={{ color: ready ? `var(${accent})` : undefined }}>
					<span className={ready ? "" : "text-muted"}>{STATUS_LABEL[status]}</span>
				</span>
				{ready && (
					<span aria-hidden style={{ color: `var(${accent})` }}>
						→
					</span>
				)}
			</p>
		</>
	);

	const shell =
		"block rounded-sm border-l-[3px] border-y border-r border-y-rule border-r-rule p-5 transition-colors sm:p-6";

	if (!ready) {
		return (
			<div
				className={`${shell} opacity-70`}
				style={{ borderLeftColor: `var(${accent})` }}
				aria-label={`${title} (${STATUS_LABEL[status].toLowerCase()})`}
			>
				{body}
			</div>
		);
	}

	return (
		<Link
			href={href}
			className={`${shell} hover:bg-foreground/[0.03]`}
			style={{ borderLeftColor: `var(${accent})` }}
		>
			{body}
		</Link>
	);
}
