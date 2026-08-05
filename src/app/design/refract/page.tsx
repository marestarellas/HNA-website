import { Lora } from "next/font/google";
import { DesignNav } from "../_components/DesignNav";
import { Caustics } from "./_Caustics";
import { LensImage } from "./_LensImage";
import { SITE_NAME, HERO, INTRO, SECTIONS } from "../_content";
import { STOCK } from "../_stock";

const lora = Lora({
	subsets: ["latin"],
	style: ["normal", "italic"],
	weight: ["400", "500"],
	variable: "--d-serif",
});

const SECTION_IMAGES = [
	STOCK.foggyForest,
	STOCK.mistyMountain,
	STOCK.sunlightTrees,
	STOCK.foggyMountain,
];

export default function RefractDesign() {
	return (
		<div
			className={`${lora.variable} relative min-h-screen overflow-x-hidden text-[#cdeef4]`}
			style={{
				background: "#051820",
				fontFamily: "var(--d-serif), Georgia, serif",
			}}
		>
			{/* Underwater caustics fixed behind everything */}
			<div className="pointer-events-none fixed inset-0 z-0">
				<Caustics />
				<div
					className="absolute inset-0"
					style={{
						background:
							"radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0) 30%, rgba(2,12,18,0.6) 100%)",
					}}
				/>
			</div>

			<DesignNav current="refract" />

			<div className="relative z-10">
				{/* Hero */}
				<section className="mx-auto flex min-h-[100vh] max-w-[1400px] flex-col justify-between px-8 py-16 md:px-16">
					<div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.32em] opacity-70">
						<span>{SITE_NAME}</span>
						<span>refract · what is underneath the surface</span>
					</div>

					<div className="max-w-5xl">
						<h1
							className="italic"
							style={{
								fontSize: "clamp(64px, 10vw, 168px)",
								fontWeight: 400,
								lineHeight: 0.92,
								letterSpacing: "-0.02em",
								color: "#e7f5f8",
								textShadow: "0 0 80px rgba(184,232,240,0.18)",
							}}
						>
							{HERO}
						</h1>
					</div>

					<div className="grid grid-cols-12 gap-6">
						<div className="col-span-12 md:col-span-5 md:col-start-8">
							<p className="text-base leading-relaxed opacity-85">{INTRO}</p>
							<p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] opacity-65">
								move your cursor across an image below ↓
							</p>
						</div>
					</div>
				</section>

				{/* Sections — each with a lens-image */}
				<section className="mx-auto max-w-[1400px] px-8 pb-32 md:px-16">
					<p className="mb-10 font-mono text-[10px] uppercase tracking-[0.32em] opacity-70">
						four entrances · the lens reveals the signal underneath
					</p>
					<div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-16">
						{SECTIONS.map((s, i) => (
							<a
								key={s.href}
								href="/design/refract"
								className="group block transition-opacity hover:opacity-95"
							>
								<LensImage
									src={SECTION_IMAGES[i]}
									alt={`${s.title} — surface and signal.`}
									caption={`entrance · ${s.number}`}
								/>
								<h3
									className="mt-6 italic"
									style={{
										fontSize: "clamp(36px, 4.5vw, 64px)",
										fontWeight: 400,
										lineHeight: 1.02,
										letterSpacing: "-0.015em",
										color: "#e7f5f8",
									}}
								>
									{s.title}
								</h3>
								<p className="mt-3 max-w-md text-sm leading-relaxed opacity-85">
									{s.blurb}
								</p>
							</a>
						))}
					</div>
				</section>

				<footer className="relative mx-auto flex max-w-[1400px] items-baseline justify-between border-t border-[#cdeef4]/15 px-8 py-6 font-mono text-[10px] uppercase tracking-[0.32em] opacity-70 md:px-16">
					<span>attuningtonature.earth</span>
					<span>refract · {new Date().getFullYear()}</span>
				</footer>
			</div>
		</div>
	);
}
