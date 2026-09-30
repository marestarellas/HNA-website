"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Is this figure worth spending anything on right now?
 *
 * The oscillations page carries nine figures. Several run an animation loop,
 * one decodes video, and four do real work on every frame or every slider
 * event. Left ungated, all of that runs from the moment the page loads,
 * including for the eight figures nobody is looking at, and the page feels
 * heavy everywhere because of work happening somewhere else.
 *
 * Two modes, because the two problems are different:
 *
 * `once: true` is for computation. Once a figure has been reached it keeps its
 * results; recomputing them on the way back up would be worse than never
 * having deferred them. The margin is generous, so the work is usually done
 * before the figure is actually looked at.
 *
 * `once: false` is for animation loops and video, which stop the moment they
 * leave the screen and start again on return. Nothing is lost by pausing them,
 * and they are what makes an idle page expensive.
 *
 * The timeout is not decoration. IntersectionObserver delivers its callbacks
 * as part of the rendering lifecycle, so anywhere frames are not being
 * produced it never reports at all: a background tab, a preview surface that
 * is not compositing, a headless capture. Gating on it alone leaves those
 * readers with four boxes that say "computing on approach" and never do.
 * Falling open after a couple of seconds costs nothing on the fast path, since
 * the load is finished by then, and removes the failure mode entirely.
 */

const FALLBACK_MS = 2500;
/**
 * Spacing between the safety-net timers of figures mounted together.
 *
 * When the observer never reports, every gate on the page falls open on the
 * same timer, and four figures then build their fields, decompositions and
 * spectra in one unbroken block: measured at 822ms of blocked main thread.
 * Scrolling normally staggers them for free, since they are reached one at a
 * time. This gives the degraded path the same courtesy.
 */
const FALLBACK_STAGGER_MS = 450;

let mounted = 0;

export function useInView(
	ref: RefObject<Element | null>,
	{ once = false, rootMargin = "300px" }: { once?: boolean; rootMargin?: string } = {}
): boolean {
	// Server-rendered markup is always the gated state, so hydration matches.
	const [inView, setInView] = useState(false);
	const settled = useRef(false);
	const heard = useRef(false);
	const slot = useRef(-1);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		// Claimed here rather than during render: a module counter read while
		// rendering is not a pure render, and would be handed out twice under
		// StrictMode.
		if (slot.current < 0) slot.current = mounted++ % 8;

		let io: IntersectionObserver | null = null;
		if (typeof IntersectionObserver !== "undefined") {
			io = new IntersectionObserver(
				(entries) => {
					heard.current = true;
					const visible = entries.some((e) => e.isIntersecting);
					if (once) {
						if (visible && !settled.current) {
							settled.current = true;
							setInView(true);
							io?.disconnect();
						}
					} else {
						setInView(visible);
					}
				},
				{ rootMargin }
			);
			io.observe(el);
		}

		const fallback = window.setTimeout(
			() => {
				if (heard.current) return;
				settled.current = true;
				setInView(true);
				io?.disconnect();
			},
			FALLBACK_MS + slot.current * FALLBACK_STAGGER_MS
		);

		return () => {
			io?.disconnect();
			window.clearTimeout(fallback);
		};
	}, [ref, once, rootMargin]);

	return inView;
}
