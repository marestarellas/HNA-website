import Link from "next/link";
import { DESIGNS } from "../_content";

// Tiny floating chrome that lets the reviewer flip between the five
// directions while keeping the same scroll position in mind. Sits fixed
// top-right; intentionally low-key so it doesn't compete with each design.
type DesignNavProps = {
	current: string;
};

export function DesignNav({ current }: DesignNavProps) {
	return (
		<nav
			aria-label="Design directions"
			className="fixed right-3 top-3 z-50 flex items-center gap-1 rounded-full border border-black/15 bg-white/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-black backdrop-blur-md shadow-sm"
			style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
		>
			<Link href="/design" className="opacity-60 transition-opacity hover:opacity-100">
				index
			</Link>
			<span className="opacity-30">·</span>
			{DESIGNS.map((d) => (
				<Link
					key={d.slug}
					href={`/design/${d.slug}`}
					className={
						d.slug === current
							? "rounded-full bg-black px-2 py-0.5 text-white"
							: "px-2 py-0.5 opacity-60 transition-opacity hover:opacity-100"
					}
					title={d.name}
				>
					{d.number}
				</Link>
			))}
		</nav>
	);
}
