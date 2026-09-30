"use client";

import { useEffect, useState } from "react";

/**
 * The value a control has stopped on, rather than the one it is passing
 * through.
 *
 * `useDeferredValue` is the right tool when the expensive part is React
 * rendering many elements, because React can abandon a low-priority render
 * partway through and start again with the newer value. It cannot help when
 * the expensive part is one `useMemo` call, because a function call is not
 * interruptible. Measured on the modal decomposition figure: dragging a slider
 * cost 5ms in the event handler and then 422ms on the next tick, every time,
 * whether or not the value had moved on again.
 *
 * So the heavy figures wait for the drag to stop. The handle and the readout
 * follow the pointer, the figure holds its last state, and the recompute runs
 * once when the reader settles on a value. Cheaper figures do not need this
 * and should keep updating live; the delay is only worth paying where the
 * alternative is a stutter.
 */
export function useSettled<T>(value: T, ms = 180): T {
	const [settled, setSettled] = useState(value);

	useEffect(() => {
		if (Object.is(settled, value)) return;
		const id = window.setTimeout(() => setSettled(value), ms);
		return () => window.clearTimeout(id);
	}, [value, ms, settled]);

	return settled;
}
