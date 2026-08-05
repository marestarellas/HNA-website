import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";

// Each Composition registered here becomes renderable by name via
// `npm run remotion:render <id> out/<id>.mp4` and previewable in the studio.
export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="HelloWorld"
				component={HelloWorld}
				durationInFrames={300}
				fps={60}
				width={1920}
				height={1080}
			/>
		</>
	);
};
