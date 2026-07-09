import { getContext, setContext } from 'svelte';

import {
	createHistory,
	record,
	redo as redoHistory,
	undo as undoHistory,
	type History
} from '../history';
import { saveEvents } from '../storage';

import type { IEvent, IUser } from '../interfaces';
import type { TBadgeVariant, TVisibleHours, TWorkingHours } from '../types';

const defaultWorkingHours = (): TWorkingHours => ({
	0: { from: 0, to: 0 },
	1: { from: 8, to: 17 },
	2: { from: 8, to: 17 },
	3: { from: 8, to: 17 },
	4: { from: 8, to: 17 },
	5: { from: 8, to: 17 },
	6: { from: 8, to: 12 }
});

const defaultVisibleHours = (): TVisibleHours => ({ from: 7, to: 18 });

const CALENDAR_KEY = Symbol('calendar');

export class CalendarState {
	// A plain Date is safe here because `selectedDate` is only ever reassigned,
	// never mutated in place — so SvelteDate would buy us nothing.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	selectedDate = $state(new Date());
	selectedUserId = $state<IUser['id'] | 'all'>('all');
	badgeVariant = $state<TBadgeVariant>('colored');
	visibleHours = $state<TVisibleHours>(defaultVisibleHours());
	workingHours = $state<TWorkingHours>(defaultWorkingHours());
	users = $state<IUser[]>([]);

	// The browser owns the events: seeded from localStorage (or mocks) after mount,
	// then mutated locally and persisted back to storage.
	events = $state<IEvent[]>([]);

	// False until the browser has read localStorage; components can wait on this.
	hydrated = $state(false);

	history = $state<History<IEvent[]>>(createHistory());
	readonly canUndo = $derived(this.history.undo.length > 0);
	readonly canRedo = $derived(this.history.redo.length > 0);

	constructor(users: IUser[]) {
		this.users = users;
	}

	selectDate(date: Date | undefined) {
		if (!date) return;
		this.selectedDate = date;
	}

	// Seeds events from storage/mocks on first mount. Deliberately does NOT record
	// history or write to storage — it is a load, not a mutation.
	hydrate(events: IEvent[]) {
		this.events = events;
		this.hydrated = true;
	}

	// The single door every mutation passes through: it snapshots the current
	// events for undo, swaps in the next array, and persists. Routing create,
	// delete, drag, resize and dialog edits all through here is what makes undo
	// cover every one of them uniformly.
	#mutate(next: IEvent[]) {
		this.history = record(this.history, this.events);
		this.events = next;
		saveEvents(next);
	}

	addEvent(event: Omit<IEvent, 'id'>) {
		const id = Math.max(...this.events.map((e) => e.id), 0) + 1;
		this.#mutate([...this.events, { ...event, id }]);
	}

	updateEvent(event: IEvent) {
		const index = this.events.findIndex((e) => e.id === event.id);
		if (index === -1) return;

		// These Dates are thrown away after the ISO string is read.
		/* eslint-disable svelte/prefer-svelte-reactivity */
		const updated: IEvent = {
			...event,
			startDate: new Date(event.startDate).toISOString(),
			endDate: new Date(event.endDate).toISOString()
		};
		/* eslint-enable svelte/prefer-svelte-reactivity */

		const next = [...this.events];
		next[index] = updated;
		this.#mutate(next);
	}

	deleteEvent(id: IEvent['id']) {
		this.#mutate(this.events.filter((e) => e.id !== id));
	}

	undo() {
		const result = undoHistory(this.history, this.events);
		if (!result) return;
		this.history = result.history;
		this.events = result.value;
		saveEvents(result.value);
	}

	redo() {
		const result = redoHistory(this.history, this.events);
		if (!result) return;
		this.history = result.history;
		this.events = result.value;
		saveEvents(result.value);
	}

	// Replaces the events wholesale without a history entry. Persists rather than
	// clears: the mocks re-randomise on every module load, so leaving storage
	// empty would mean the next reload showed different events than the reset did.
	reset(events: IEvent[]) {
		this.history = createHistory();
		this.events = events;
		saveEvents(events);
	}
}

export function setCalendarState(users: IUser[]) {
	return setContext(CALENDAR_KEY, new CalendarState(users));
}

export function getCalendarState(): CalendarState {
	const state = getContext<CalendarState | undefined>(CALENDAR_KEY);
	if (!state) throw new Error('getCalendarState must be used within a <CalendarProvider>.');
	return state;
}
