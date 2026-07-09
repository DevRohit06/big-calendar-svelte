import { getContext, setContext } from 'svelte';

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

	// In a real scenario the events would be updated in the backend and refetched.
	// This local copy exists only to simulate that.
	events = $state<IEvent[]>([]);

	constructor(users: IUser[], events: IEvent[]) {
		this.users = users;
		this.events = events;
	}

	selectDate(date: Date | undefined) {
		if (!date) return;
		this.selectedDate = date;
	}

	updateEvent(event: IEvent) {
		const index = this.events.findIndex((e) => e.id === event.id);
		if (index === -1) return;

		// These Dates are thrown away after the ISO string is read.
		/* eslint-disable svelte/prefer-svelte-reactivity */
		this.events[index] = {
			...event,
			startDate: new Date(event.startDate).toISOString(),
			endDate: new Date(event.endDate).toISOString()
		};
		/* eslint-enable svelte/prefer-svelte-reactivity */
	}
}

export function setCalendarState(users: IUser[], events: IEvent[]) {
	return setContext(CALENDAR_KEY, new CalendarState(users, events));
}

export function getCalendarState(): CalendarState {
	const state = getContext<CalendarState | undefined>(CALENDAR_KEY);
	if (!state) throw new Error('getCalendarState must be used within a <CalendarProvider>.');
	return state;
}
