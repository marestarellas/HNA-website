import { Cormorant_Garamond, Inter } from "next/font/google";
import { DesignNav } from "../_components/DesignNav";
import { CustomCursor } from "./_CustomCursor";
import { Scene } from "./_Scene";
import { SITE_NAME, HERO, INTRO, SECTIONS } from "../_content";
import { STOCK } from "../_stock";

const cormorant = Cormorant_Garamond({
	subsets: ["latin"],
	weight: ["300", "400"],
	style: ["normal", "italic"],
	variable: "--d-serif",
});
const inter = Inter({ subsets: ["latin"], variable: "--d-sans", weight: ["300", "400"] });

const SCENE_IMAGES = [STOCK.foggyForest, STOCK.mistyMountain, STOCK.sunlightTrees, STOCK.foggyMountain];

export default function ImmersiveDesign() {
	return (
		<div
			className={`${cormorant.variable} ${inter.variable} relative bg-black text-white`}
			style={{
				fontFamily: "var(--d-sans), system-ui, sans-serif",
				cursor: "none",
			}}
		>
			<style>{`html { scroll-behavior: smooth; }`}</style>
			<CustomCursor />
			<DesignNav current="immersive" />

			{/* Tiny fixed brand mark, top-left */}
			<div className="pointer-events-none fixed left-6 top-5 z-50 text-[10px] uppercase tracking-[0.32em] text-white/70">
				{SITE_NAME}
			</div>

			{/* Hero scene */}
			<Scene
				image={STOCK.forestLight}
				imageAlt="Light streaming through a stand of pines."
				eyebrow="enter"
				title={
					<span style={{ fontFamily: "var(--d-serif), Georgia, serif", fontStyle: "italic" }}>
						{HERO}
					</span>
				}
				body={<p>{INTRO}</p>}
			/>

			{/* One scene per section */}
			{SECTIONS.map((s, i) => (
				<Scene
					key={s.href}
					image={SCENE_IMAGES[i % SCENE_IMAGES.length]}
					imageAlt={`${s.title} — atmosphere.`}
					eyebrow={`Entrance · ${s.number}`}
					title={
						<span style={{ fontFamily: "var(--d-serif), Georgia, serif", fontStyle: "italic" }}>
							{s.title}
						</span>
					}
					body={<p className="opacity-90">{s.blurb}</p>}
				/>
			))}

			{/* Closing scene */}
			<Scene
				image={STOCK.mountainDistance}
				imageAlt="A distant mountain at dusk."
				eyebrow="closing"
				title={
					<span
						style={{
							fontFamily: "var(--d-serif), Georgia, serif",
							fontStyle: "italic",
							fontSize: "clamp(36px, 5vw, 72px)",
						}}
					>
						how do bodies fall into rhythm with the places they live in?
					</span>
				}
			/>

			<footer
				className="relative bg-black px-8 py-8 text-[10px] uppercase tracking-[0.32em] text-white/50 md:px-16"
				style={{ cursor: "none" }}
			>
				<div className="mx-auto flex max-w-[1500px] items-baseline justify-between">
					<span>attuningtonature.earth</span>
					<span>immersive · {new Date().getFullYear()}</span>
				</div>
			</footer>
		</div>
	);
}
