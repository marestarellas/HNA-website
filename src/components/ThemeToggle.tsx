"use client";

import { useTheme, setTheme } from "./useTheme";

/**
 * Light / dark switch. The only one on the site.
 *
 * All the state lives in `useTheme`, so that anything else that has to follow
 * the same switch (the atlas on /stories paints a palette of its own) reads one
 * value instead of keeping a second copy of the setting.
 */
export function ThemeToggle() {
	const isDark = useTheme() === "dark";

	return (
		<button
			type="button"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
			title={isDark ? "Switch to light theme" : "Switch to dark theme"}
			className="-m-2 flex h-8 w-8 items-center justify-center rounded-full p-2 text-muted transition-colors hover:text-foreground"
		>
			{/* Drawn rather than typed, so it inherits colour and sits predictably. */}
			<svg
				width="15"
				height="15"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
				aria-hidden
			>
				{isDark ? (
					<path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z" />
				) : (
					<>
						<circle cx="8" cy="8" r="3.1" />
						<path d="M8 1v1.4M8 13.6V15M15 8h-1.4M2.4 8H1M12.9 3.1l-1 1M4.1 11.9l-1 1M12.9 12.9l-1-1M4.1 4.1l-1-1" />
					</>
				)}
			</svg>
		</button>
	);
}
