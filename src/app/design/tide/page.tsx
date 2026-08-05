import { Lora } from "next/font/google";
import { DesignNav } from "../_components/DesignNav";
import { GrainOverlay } from "../_GrainOverlay";
import { InkBlobs } from "./_InkBlobs";
import { SITE_NAME, HERO, INTRO, SECTIONS } from "../_content";

const lora = Lora({
	subsets: ["latin"],
	style: ["normal", "italic"],
	weight: ["400", "500"],
	variable: "--d-serif",
});

export default function TideDesign() {
	return (
		<div
			className={`${lora.variable} relative min-h-screen overflow-hidden`}
			style={{
				background: "#f6ecd8",
				color: "#2a160a",
				fontFamily: "var(--d-serif), Georgia, serif",
			}}
		>
			{/* Ink blobs sit fixed behind the content */}
			<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
				<InkBlobs />
			</div>

			<GrainOverlay opacity={0.16} blend="multiply" id="tide-grain" baseFrequency={0.95} />
			<DesignNav current="tide" />

			<div className="relative z-10">
				{/* Hero */}
				<section className="mx-auto flex min-h-[100vh] max-w-[1400px] flex-col justify-between px-8 py-16 md:px-16">
					<div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.32em] opacity-60">
						<span>{SITE_NAME}</span>
						<span>tide · pigment in slow water</span>
					</div>

					<div className="max-w-5xl">
						<h1
							className="italic"
							style={{
								fontSize: "clamp(64px, 10vw, 168px)",
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

				{/* Sections — long single-column scroll */}
				<section className="mx-auto max-w-[1400px] px-8 pb-32 md:px-16">
					<p className="mb-16 text-[10px] uppercase tracking-[0.32em] opacity-60">
						four entrances
					</p>
					<div className="space-y-24">
						{SECTIONS.map((s) => (
							<a
								key={s.href}
								href="/design/tide"
								className="group block transition-opacity hover:opacity-75"
							>
								<div className="grid grid-cols-12 items-baseline gap-6">
									<div className="col-span-12 md:col-span-2">
										<span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
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
										<p className="mt-4 max-w-2xl text-base leading-relaxed opacity-80">
											{s.blurb}
										</p>
									</div>
								</div>
							</a>
						))}
					</div>
				</section>

				<footer className="relative mx-auto flex max-w-[1400px] items-baseline justify-between border-t border-[#2a160a]/20 px-8 py-6 text-[10px] uppercase tracking-[0.32em] opacity-60 md:px-16">
					<span>attuningtonature.earth</span>
					<span>tide · {new Date().getFullYear()}</span>
				</footer>
			</div>
		</div>
	);
}
