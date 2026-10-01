import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

// Same order as the four entrances on the landing page, with Experiment last
// because it is the one section that is not built yet.
const NAV = [
	{ href: "/learn", label: "Learn" },
	{ href: "/science", label: "Science" },
	{ href: "/stories", label: "Stories" },
	{ href: "/inspiration", label: "Inspiration" },
	{ href: "/experiment", label: "Experiment" },
];

export function SiteHeader() {
	return (
		<header className="border-b border-rule">
			<div className="mx-auto flex w-full max-w-5xl items-baseline justify-between px-6 py-5 font-sans">
				<Link
					href="/"
					className="text-sm uppercase tracking-[0.22em] text-foreground"
				>
					attuning to nature
				</Link>
				<div className="flex items-baseline gap-6">
					<nav>
						<ul className="flex items-baseline gap-6 text-xs uppercase tracking-[0.18em] text-muted">
							{NAV.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										className="transition-colors hover:text-foreground"
									>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
