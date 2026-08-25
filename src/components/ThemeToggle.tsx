"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "atn-theme";
const CHANGE_EVENT = "atn-theme-change";

/**
 * Light / dark switch.
 *
 * The site follows the operating system until someone says otherwise; choosing
 * writes `data-theme` on <html> and remembers it. The CSS in globals.css guards
 * its dark media query with `:not([data-theme="light"])`, so a reader on a dark
 * machine who asks for light actually gets it.
 *
 * The current theme is read through `useSyncExternalStore` rather than an
 * effect. The value only exists in the browser, so the server has to render
 * *something* — and reading it during render, or setting state from an effect,
 * gives either a hydration mismatch or a cascading re-render. This hook is
 * built for the case: it renders `getServerSnapshot` while hydrating and adopts
 * the real value immediately afterwards. An inline script in the root layout
 * has already set the attribute before first paint, so nothing flashes.
 */

function subscribe(onChange: () => void): () => void {
	const mq = window.matchMedia("(prefers-color-scheme: dark)");
	mq.addEventListener("change", onChange);
	// `storage` keeps other tabs in step; the custom event covers this one,
	// since writing localStorage does not notify the tab that wrote it.
	window.addEventListener("storage", onChange);
	window.addEventListener(CHANGE_EVENT, onChange);
	return () => {
		mq.removeEventListener("change", onChange);
		window.removeEventListener("storage", onChange);
		window.removeEventListener(CHANGE_EVENT, onChange);
	};
}

function getSnapshot(): Theme {
	const explicit = document.documentElement.dataset.theme;
	if (explicit === "light" || explicit === "dark") return explicit;
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored === "light" || stored === "dark") return stored;
	} catch {
		// Private browsing can throw on localStorage; fall through to the system.
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerSnapshot(): Theme {
	return "light";
}

export function ThemeToggle() {
	const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	const isDark = theme === "dark";

	const toggle = () => {
		const next: Theme = isDark ? "light" : "dark";
		document.documentElement.dataset.theme = next;
		try {
			window.localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// Not being able to remember the choice is survivable.
		}
		window.dispatchEvent(new Event(CHANGE_EVENT));
	};

	return (
		<button
			type="button"
			onClick={toggle}
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
