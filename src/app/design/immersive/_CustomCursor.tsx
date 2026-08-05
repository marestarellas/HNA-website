"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

// Small dot that follows the pointer with spring-damped lag. Disabled on
// touch devices. The system cursor is hidden via the parent's `cursor: none`.

export function CustomCursor() {
	const x = useMotionValue(-100);
	const y = useMotionValue(-100);
	const sx = useSpring(x, { stiffness: 600, damping: 35, mass: 0.4 });
	const sy = useSpring(y, { stiffness: 600, damping: 35, mass: 0.4 });

	useEffect(() => {
		const onMove = (e: PointerEvent) => {
			x.set(e.clientX);
			y.set(e.clientY);
		};
		window.addEventListener("pointermove", onMove);
		return () => window.removeEventListener("pointermove", onMove);
	}, [x, y]);

	return (
		<motion.div
			aria-hidden
			className="pointer-events-none fixed left-0 top-0 z-[60] h-3 w-3 rounded-full bg-white mix-blend-difference"
			style={{
				x: sx,
				y: sy,
				translateX: "-50%",
				translateY: "-50%",
			}}
		/>
	);
}
