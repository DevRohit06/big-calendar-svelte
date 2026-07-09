/**
 * Snapshot-based undo. Each entry is a whole copy of the previous events array.
 * The list is tens of items, so a snapshot costs a few hundred bytes — far
 * cheaper than inverting `resizeEvent`'s clamping and `moveEventToDay`'s
 * duration math, which a command/inverse design would have to get exactly right.
 */
export const MAX_HISTORY = 50;

export type History<T> = { undo: T[]; redo: T[] };

export function createHistory<T>(): History<T> {
	return { undo: [], redo: [] };
}

/** Records the pre-mutation snapshot. Any new mutation invalidates the redo stack. */
export function record<T>(history: History<T>, snapshot: T): History<T> {
	return { undo: [...history.undo, snapshot].slice(-MAX_HISTORY), redo: [] };
}

export function undo<T>(history: History<T>, current: T): { history: History<T>; value: T } | null {
	const value = history.undo.at(-1);
	if (value === undefined) return null;

	return {
		history: {
			undo: history.undo.slice(0, -1),
			redo: [...history.redo, current].slice(-MAX_HISTORY)
		},
		value
	};
}

export function redo<T>(history: History<T>, current: T): { history: History<T>; value: T } | null {
	const value = history.redo.at(-1);
	if (value === undefined) return null;

	return {
		history: {
			undo: [...history.undo, current].slice(-MAX_HISTORY),
			redo: history.redo.slice(0, -1)
		},
		value
	};
}
