"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "atn-theme";
const CHANGE_EVENT = "atn-theme-change";

/**
 * The site's one source of truth for light and dark.
 *
 * The site follows the operating system until someone says otherwise; choosing
 * writes `data-theme` on <html> and remembers it. The CSS in globals.css guards
 * its dark media query with `:not([data-theme="light"])`, so a reader on a dark
 * machine who asks for light actually gets it.
 *
 * This lives apart from the toggle button because more than one thing needs to
 * read it. The atlas on /stories keeps its own palette, painted as custom
 * properties on <body>, and it has to follow the same switch as everything
 * else. Two independent toggles for one setting is a bug a reader meets
 * immediately: they press one, half the page changes.
 *
 * The value is read through `useSyncExternalStore` rather than an effect. It
 * only exists in the browser, so the server has to render *something* — and
 * reading it during render, or setting state from an effect, gives either a
 * hydration mismatch or a cascading re-render. This hook is built for the case:
 * it renders `getServerSnapshot` while hydrating and adopts the real value
 * immediately afterwards. An inline script in the root layout has already set
 * the attribute before first paint, so nothing flashes.
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

/** The theme in force right now, updating whenever anything changes it. */
export function useTheme(): Theme {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Change the theme. Everything using `useTheme` follows within the same tick. */
export function setTheme(next: Theme): void {
	document.documentElement.dataset.theme = next;
	try {
		window.localStorage.setItem(STORAGE_KEY, next);
	} catch {
		// Not being able to remember the choice is survivable.
	}
	window.dispatchEvent(new Event(CHANGE_EVENT));
}
