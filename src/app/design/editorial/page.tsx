import { Fraunces, Inter } from "next/font/google";
import { DesignNav } from "../_components/DesignNav";
import { SITE_NAME, HERO, INTRO, SECTIONS } from "../_content";

const fraunces = Fraunces({
	subsets: ["latin"],
	variable: "--d-serif",
	axes: ["opsz", "SOFT"],
});
const inter = Inter({ subsets: ["latin"], variable: "--d-sans" });

const COVER_PALETTE = [
	{ bg: "#1f3a2e", fg: "#f0e7d3", caption: "Forest, Patagonia" },
	{ bg: "#2a3949", fg: "#e9eef3", caption: "North Sea, dusk" },
	{ bg: "#a8523a", fg: "#fbf1e3", caption: "Atacama, dawn" },
	{ bg: "#e9dfca", fg: "#3a2b1d", caption: "Salt flat, midday" },
];

export default function EditorialDesign() {
	return (
		<div
			className={`${fraunces.variable} ${inter.variable} min-h-screen`}
			style={{
				background: "#f4ede0",
				color: "#1a1612",
				fontFamily: "var(--d-sans), system-ui, sans-serif",
			}}
		>
			<DesignNav current="editorial" />

			<header className="mx-auto max-w-[1400px] px-8 pt-24 pb-12 md:px-16">
				<div className="flex items-end justify-between gap-8">
					<div>
						<p className="text-[10px] uppercase tracking-[0.32em] opacity-60">
							Issue No. I · {new Date().getFullYear()}
						</p>
						<h1
							className="mt-4 leading-[0.85] tracking-[-0.02em]"
							style={{
								fontFamily: "var(--d-serif), serif",
								fontSize: "clamp(72px, 11vw, 168px)",
								fontWeight: 400,
								fontVariationSettings: '"opsz" 144',
							}}
						>
							{SITE_NAME}
						</h1>
					</div>
					<div className="hidden max-w-xs text-right text-xs uppercase tracking-[0.2em] opacity-60 md:block">
						a periodical of bodies, places, and the rhythms between them
					</div>
				</div>
			</header>

			<section className="mx-auto max-w-[1400px] px-8 md:px-16">
				<div
					className="relative overflow-hidden"
					style={{
						aspectRatio: "16/9",
						background:
							"linear-gradient(160deg, #324a3a 0%, #1a2c20 60%, #0d1812 100%)",
					}}
				>
					<div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12 text-[#f0e7d3]">
						<div className="flex justify-between text-[10px] uppercase tracking-[0.3em] opacity-80">
							<span>Cover Story · Folio 01</span>
							<span>{SITE_NAME}</span>
						</div>
						<h2
							className="max-w-3xl leading-[0.95] tracking-[-0.015em]"
							style={{
								fontFamily: "var(--d-serif), serif",
								fontSize: "clamp(36px, 5vw, 72px)",
								fontVariationSettings: '"opsz" 96, "SOFT" 100',
							}}
						>
							{HERO}
						</h2>
						<div className="flex items-end justify-between gap-12">
							<p className="max-w-md text-sm leading-relaxed opacity-85">
								{INTRO}
							</p>
							<div className="text-right text-[10px] uppercase tracking-[0.3em] opacity-70">
								Forest, Patagonia · 04:42 a.m.
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto mt-16 max-w-[1400px] px-8 md:px-16">
				<div className="mb-6 flex items-baseline justify-between">
					<h3 className="text-[10px] uppercase tracking-[0.32em] opacity-60">
						In this issue
					</h3>
					<span className="text-[10px] uppercase tracking-[0.32em] opacity-40">
						four entries
					</span>
				</div>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
					{SECTIONS.map((s, i) => {
						const palette = COVER_PALETTE[i];
						return (
							<a
								key={s.href}
								href={`/design/editorial`}
								className="group relative block overflow-hidden transition-transform duration-700 ease-out hover:-translate-y-1"
								style={{
									aspectRatio: "3/4",
									background: palette.bg,
									color: palette.fg,
								}}
							>
								<div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6">
									<div className="flex justify-between text-[9px] uppercase tracking-[0.28em] opacity-80">
										<span>No. {s.number}</span>
										<span>{palette.caption}</span>
									</div>
									<h4
										className="leading-[0.9]"
										style={{
											fontFamily: "var(--d-serif), serif",
											fontSize: "clamp(24px, 2.6vw, 40px)",
											fontVariationSettings: '"opsz" 72',
										}}
									>
										{s.title}
									</h4>
									<p className="text-[11px] leading-snug opacity-80">{s.blurb}</p>
								</div>
							</a>
						);
					})}
				</div>
			</section>

			<footer className="mx-auto mt-24 max-w-[1400px] border-t border-black/15 px-8 py-8 md:px-16">
				<div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.28em] opacity-60">
					<span>{SITE_NAME} · {new Date().getFullYear()}</span>
					<span>attuningtonature.earth</span>
					<span>colophon</span>
				</div>
			</footer>
		</div>
	);
}
