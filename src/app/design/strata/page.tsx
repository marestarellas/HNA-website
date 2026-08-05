import { Lora } from "next/font/google";
import { DesignNav } from "../_components/DesignNav";
import { GrainOverlay } from "../_GrainOverlay";
import { StrataBands } from "./_StrataBands";
import { SITE_NAME, HERO, INTRO, SECTIONS } from "../_content";

const lora = Lora({
	subsets: ["latin"],
	style: ["normal", "italic"],
	weight: ["400", "500"],
	variable: "--d-serif",
});

export default function StrataDesign() {
	return (
		<div
			className={`${lora.variable} relative overflow-x-hidden text-[#e9dfca]`}
			style={{
				background: "#101820",
				fontFamily: "var(--d-serif), Georgia, serif",
			}}
		>
			{/* Strata bands fill the first viewport */}
			<div className="relative h-screen w-full">
				<div className="absolute inset-0">
					<StrataBands />
				</div>
				<GrainOverlay opacity={0.22} blend="multiply" id="strata-grain" baseFrequency={1.1} />
				<DesignNav current="strata" />

				{/* Hero text sits over the top wash */}
				<section className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-between px-8 py-16 text-[#2a160a] md:px-16">
					<div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.32em] opacity-60">
						<span>{SITE_NAME}</span>
						<span>strata · the long compression of time</span>
					</div>

					<div className="max-w-5xl">
						<h1
							className="italic"
							style={{
								fontSize: "clamp(56px, 9vw, 152px)",
								fontWeight: 400,
								lineHeight: 0.92,
								letterSpacing: "-0.02em",
							}}
						>
							{HERO}
						</h1>
					</div>

					<div className="grid grid-cols-12 gap-6">
						<div className="col-span-12 md:col-span-5 md:col-start-8">
							<p className="text-base leading-relaxed opacity-85">{INTRO}</p>
						</div>
					</div>
				</section>
			</div>

			{/* Sections live over the deep-brown band that continues below the
				strata svg — feels like descending through layers. */}
			<section className="relative mx-auto max-w-[1400px] px-8 py-32 md:px-16">
				<p className="mb-16 text-[10px] uppercase tracking-[0.32em] opacity-60">
					four entrances · descending
				</p>
				<div className="space-y-24">
					{SECTIONS.map((s, i) => (
						<a
							key={s.href}
							href="/design/strata"
							className="group block transition-opacity hover:opacity-80"
						>
							<div
								className="grid grid-cols-12 items-baseline gap-6 border-t pt-10"
								style={{ borderColor: "rgba(239,225,194,0.18)" }}
							>
								<div className="col-span-12 md:col-span-2">
									<span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
										layer {String(i + 1).padStart(2, "0")} · {s.number}
									</span>
								</div>
								<div className="col-span-12 md:col-span-10">
									<h3
										className="italic"
										style={{
											fontSize: "clamp(40px, 5.5vw, 88px)",
											fontWeight: 400,
											lineHeight: 1,
											letterSpacing: "-0.015em",
										}}
									>
										{s.title}
									</h3>
									<p className="mt-4 max-w-2xl text-base leading-relaxed opacity-80">
										{s.blurb}
									</p>
								</div>
							</div>
						</a>
					))}
				</div>
			</section>

			<footer
				className="relative mx-auto flex max-w-[1400px] items-baseline justify-between border-t px-8 py-6 text-[10px] uppercase tracking-[0.32em] opacity-60 md:px-16"
				style={{ borderColor: "rgba(239,225,194,0.18)" }}
			>
				<span>attuningtonature.earth</span>
				<span>strata · {new Date().getFullYear()}</span>
			</footer>
		</div>
	);
}
