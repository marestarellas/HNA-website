import { Fraunces } from "next/font/google";
import { DesignNav } from "../_components/DesignNav";
import { GrainOverlay } from "../_GrainOverlay";
import { Rivulets } from "./_Rivulets";
import { SITE_NAME, HERO, INTRO } from "../_content";
import { PALETTE } from "../_palette";

const fraunces = Fraunces({
	subsets: ["latin"],
	style: ["normal", "italic"],
	weight: ["300", "400"],
	variable: "--d-serif",
});

/**
 * Confluence.
 *
 * The four entrances are not a list here; they are the four sources of one
 * watershed, and the space between them is the sand the water is finding its
 * way across. That is why the section carrying them is nearly two screens
 * tall: streams need room to wander before converging means anything.
 */
export default function ConfluenceDesign() {
	return (
		<div
			className={`${fraunces.variable} relative min-h-screen overflow-x-hidden`}
			style={{
				background: PALETTE.creamBg,
				color: PALETTE.inkText,
				fontFamily: "var(--d-serif), Georgia, serif",
			}}
		>
			{/* Wet sand: a faint warm ground for the water to run over. */}
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 z-0"
				style={{
					background:
						"radial-gradient(90% 60% at 50% 0%, rgba(233,223,202,0.9) 0%, rgba(244,237,224,0) 65%)",
				}}
			/>

			<GrainOverlay opacity={0.12} blend="multiply" />
			<DesignNav current="confluence" />

			<div className="relative z-10">
				<section className="mx-auto flex min-h-[86vh] max-w-[1200px] flex-col justify-between px-8 py-14 md:px-14">
					<div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">
						<span>{SITE_NAME}</span>
						<span>four sources, one channel</span>
					</div>

					<div className="max-w-3xl py-14">
						<h1
							style={{
								fontSize: "clamp(38px, 5.6vw, 88px)",
								fontWeight: 300,
								lineHeight: 1.04,
								letterSpacing: "-0.022em",
							}}
						>
							{HERO}
						</h1>
						<p className="mt-9 max-w-xl text-[17px] leading-relaxed opacity-70">
							{INTRO}
						</p>
					</div>

					<p className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-45">
						follow a stream down
					</p>
				</section>

				<Rivulets />

				<footer className="mx-auto flex max-w-[1200px] items-baseline justify-between px-8 pb-14 pt-20 font-mono text-[10px] uppercase tracking-[0.3em] opacity-45 md:px-14">
					<span>attuningtonature.earth</span>
					<span>confluence</span>
				</footer>
			</div>
		</div>
	);
}
