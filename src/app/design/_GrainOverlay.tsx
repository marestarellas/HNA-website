// Reusable hairline grain overlay for the earthy directions. SVG turbulence
// is rendered once into the page; a div with that filter applied composites
// over everything beneath via mix-blend-mode. The filter id is suffixed so
// multiple instances on one page don't collide (rare, but cheap to support).

type GrainOverlayProps = {
	id?: string;
	opacity?: number;
	baseFrequency?: number;
	blend?: "multiply" | "overlay" | "soft-light";
};

export function GrainOverlay({
	id = "grain",
	opacity = 0.18,
	baseFrequency = 0.9,
	blend = "multiply",
}: GrainOverlayProps) {
	return (
		<>
			<svg className="pointer-events-none fixed inset-0 h-0 w-0" aria-hidden>
				<filter id={id}>
					<feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves={2} stitchTiles="stitch" />
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
					/>
				</filter>
			</svg>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 z-30"
				style={{
					filter: `url(#${id})`,
					opacity,
					mixBlendMode: blend,
				}}
			/>
		</>
	);
}
