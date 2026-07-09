import type { IEvent } from './interfaces';

const KEY = 'big-calendar:events';
const VERSION = 1;

type Stored = { version: number; events: IEvent[] };

export function encode(events: IEvent[]): string {
	return JSON.stringify({ version: VERSION, events } satisfies Stored);
}

/** Returns null for anything we can't trust, so callers fall back to the mocks. */
export function decode(raw: string | null): IEvent[] | null {
	if (!raw) return null;

	try {
		const parsed: unknown = JSON.parse(raw);
		if (typeof parsed !== 'object' || parsed === null) return null;

		const stored = parsed as Partial<Stored>;
		if (stored.version !== VERSION || !Array.isArray(stored.events)) return null;

		return stored.events;
	} catch {
		return null;
	}
}

// `localStorage` throws in private-mode Safari and when the quota is exhausted.
// Degrade to in-memory: the calendar keeps working, it just forgets.

export function loadEvents(): IEvent[] | null {
	try {
		return decode(localStorage.getItem(KEY));
	} catch {
		return null;
	}
}

export function saveEvents(events: IEvent[]): void {
	try {
		localStorage.setItem(KEY, encode(events));
	} catch {
		// Ignored on purpose — see above.
	}
}
