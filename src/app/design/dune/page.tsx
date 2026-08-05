import { Lora } from "next/font/google";
import { DesignNav } from "../_components/DesignNav";
import { GrainOverlay } from "../_GrainOverlay";
import { DuneFlow } from "./_DuneFlow";
import { SITE_NAME, HERO, INTRO, SECTIONS } from "../_content";

const lora = Lora({
	subsets: ["latin"],
	style: ["normal", "italic"],
	weight: ["400", "500"],
	variable: "--d-serif",
});

export default function DuneDesign() {
	return (
		<div
			className={`${lora.variable} relative overflow-x-hidden text-[#0f2218]`}
			style={{
				background:
					"linear-gradient(180deg, #f4ede0 0%, #e9c478 35%, #a8523a 60%, #1f3a2e 80%, #050a07 100%)",
				fontFamily: "var(--d-serif), Georgia, serif",
			}}
		>
			{/* Hero viewport with the dune flow filling the lower half */}
			<div className="relative h-screen w-full">
				<div className="absolute inset-0">
					<DuneFlow />
				</div>

				{/* Sky wash — warm cream over the dune top so the hero type breathes */}
				<div
					className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
					style={{
						background:
							"linear-gradient(180deg, rgba(244,237,224,0.92) 0%, rgba(244,237,224,0) 100%)",
					}}
				/>

				<GrainOverlay opacity={0.18} blend="multiply" id="dune-grain" baseFrequency={0.95} />
				<DesignNav current="dune" />

				<section className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-between px-8 py-16 md:px-16">
					<div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.32em] opacity-65">
						<span>{SITE_NAME}</span>
						<span>dune · long flow under low sun</span>
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

			{/* Sections — over the deep-umber continuation */}
			<section
				className="relative mx-auto max-w-[1400px] px-8 py-32 text-[#f0d9a8] md:px-16"
			>
				<p className="mb-16 text-[10px] uppercase tracking-[0.32em] opacity-65">
					four entrances
				</p>
				<div className="space-y-24">
					{SECTIONS.map((s) => (
						<a
							key={s.href}
							href="/design/dune"
							className="group block transition-opacity hover:opacity-75"
						>
							<div
								className="grid grid-cols-12 items-baseline gap-6 border-t pt-10"
								style={{ borderColor: "rgba(240,217,168,0.18)" }}
							>
								<div className="col-span-12 md:col-span-2">
									<span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-65">
										{s.number}
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
									<p className="mt-4 max-w-2xl text-base leading-relaxed opacity-85">
										{s.blurb}
									</p>
								</div>
							</div>
						</a>
					))}
				</div>
			</section>

			<footer
				className="relative mx-auto flex max-w-[1400px] items-baseline justify-between border-t px-8 py-6 text-[10px] uppercase tracking-[0.32em] text-[#f0d9a8] opacity-65 md:px-16"
				style={{ borderColor: "rgba(240,217,168,0.18)" }}
			>
				<span>attuningtonature.earth</span>
				<span>dune · {new Date().getFullYear()}</span>
			</footer>
		</div>
	);
}
