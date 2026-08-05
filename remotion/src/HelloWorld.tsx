import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Bootstrap-only placeholder composition. Replace once the design system lands
// and real educational concepts (entrainment, complexity matching, etc.) get
// their own files under remotion/src/concepts/.
export const HelloWorld: React.FC = () => {
	const frame = useCurrentFrame();

	const opacity = interpolate(frame, [0, 60, 240, 300], [0, 1, 1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: "#0a0a0a",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: "#f5f5f5",
				fontFamily: "serif",
				fontSize: 96,
				letterSpacing: "0.02em",
				opacity,
			}}
		>
			attuning to nature
		</AbsoluteFill>
	);
};
