import { Lora } from "next/font/google";
import { DesignNav } from "../_components/DesignNav";
import { GrainOverlay } from "../_GrainOverlay";
import { DescentStage, SurfaceVideo } from "./_Descent";
import { SITE_NAME, HERO, INTRO, SECTIONS } from "../_content";

const lora = Lora({
	subsets: ["latin"],
	style: ["normal", "italic"],
	weight: ["400", "500"],
	variable: "--d-serif",
});

/**
 * Descent.
 *
 * The sections are spaced by long empty column rather than by margin. The
 * emptiness is the design: without a stretch of nothing between them the
 * change in light never registers, and the page reads as four blocks on a
 * gradient instead of as a descent.
 */
export default function DescentDesign() {
	return (
		<div
			className={`${lora.variable} relative`}
			style={{ fontFamily: "var(--d-serif), Georgia, serif" }}
		>
			<GrainOverlay opacity={0.09} blend="soft-light" />
			<DesignNav current="descent" />

			<DescentStage>
				{/* ------------------------------------------------------- surface */}
				<section className="relative flex min-h-[100vh] flex-col justify-between px-8 py-14 md:px-14">
					<SurfaceVideo />

					<div className="relative flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
						<span>{SITE_NAME}</span>
						<span>0m · surface</span>
					</div>

					<div className="relative mx-auto max-w-4xl py-20 text-center">
						<h1
							style={{
								fontSize: "clamp(40px, 6vw, 96px)",
								fontWeight: 400,
								lineHeight: 1.04,
								letterSpacing: "-0.022em",
							}}
						>
							{HERO}
						</h1>
						<p className="mx-auto mt-10 max-w-xl text-[17px] leading-relaxed opacity-75">
							{INTRO}
						</p>
					</div>

					<div className="relative flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.3em] opacity-55">
						<span>scroll to descend</span>
						<span aria-hidden>&darr;</span>
					</div>
				</section>

				{/* ------------------------------------------------- the column */}
				{SECTIONS.map((s, i) => (
					<section
						key={s.href}
						className="relative flex min-h-[130vh] items-center px-8 md:px-14"
					>
						<div className="mx-auto w-full max-w-4xl">
							<div className="flex items-baseline gap-5">
								<span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">
									{s.number}
								</span>
								<span
									aria-hidden
									className="h-px flex-1"
									style={{ background: "currentColor", opacity: 0.18 }}
								/>
								<span className="font-mono text-[10px] tabular-nums opacity-50">
									{[12, 40, 70, 98][i]}m
								</span>
							</div>

							<a href="/design/descent" className="group mt-8 block transition-opacity hover:opacity-75">
								<h2
									style={{
										fontSize: "clamp(32px, 4.6vw, 68px)",
										fontWeight: 400,
										lineHeight: 1.05,
										letterSpacing: "-0.02em",
									}}
								>
									{s.title}
								</h2>
								<p className="mt-5 max-w-xl text-[16px] leading-relaxed opacity-75">
									{s.blurb}
								</p>
								<span className="mt-8 inline-block font-mono text-[10px] uppercase tracking-[0.3em] opacity-0 transition-opacity group-hover:opacity-70">
									enter &rarr;
								</span>
							</a>
						</div>
					</section>
				))}

				<footer className="relative flex items-baseline justify-between px-8 pb-16 pt-24 font-mono text-[10px] uppercase tracking-[0.3em] opacity-50 md:px-14">
					<span>attuningtonature.earth</span>
					<span>descent · 120m</span>
				</footer>
			</DescentStage>
		</div>
	);
}
