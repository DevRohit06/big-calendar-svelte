import { addMinutes, differenceInMinutes, parseISO, set } from 'date-fns';

import type { IEvent } from '../../interfaces';

/** Time slots are 15 minutes tall and an hour is 96px, per the week/day grids. */
export const SLOT_MINUTES = 15;
export const HOUR_HEIGHT = 96;
export const PX_PER_MINUTE = HOUR_HEIGHT / 60;

/** An event may never be resized below a single slot. */
export const MIN_EVENT_MINUTES = SLOT_MINUTES;

const DRAG_KEY = 'calendar-event';

type EventDragData = {
	[DRAG_KEY]: true;
	event: IEvent;
};

export function eventDragData(event: IEvent): EventDragData {
	return { [DRAG_KEY]: true, event };
}

export function isEventDragData(data: Record<string | symbol, unknown>): data is EventDragData {
	return data[DRAG_KEY] === true;
}

/** Rounds a minute delta to the nearest slot boundary. */
export function snapToSlot(minutes: number) {
	return Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES;
}

/** Re-anchors an event to `newStart`, preserving its duration. */
function reanchor(event: IEvent, newStart: Date): IEvent {
	const duration = differenceInMinutes(parseISO(event.endDate), parseISO(event.startDate));

	return {
		...event,
		startDate: newStart.toISOString(),
		endDate: addMinutes(newStart, duration).toISOString()
	};
}

/** Month view: change the day, keep the time of day and the duration. */
export function moveEventToDay(event: IEvent, day: Date): IEvent {
	const start = parseISO(event.startDate);

	return reanchor(
		event,
		set(day, {
			hours: start.getHours(),
			minutes: start.getMinutes(),
			seconds: 0,
			milliseconds: 0
		})
	);
}

/** Week/day view: change the day and the time of day, keep the duration. */
export function moveEventToTime(event: IEvent, day: Date, hour: number, minute: number): IEvent {
	return reanchor(event, set(day, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 }));
}

/**
 * Drags one edge of an event by `deltaMinutes`, snapping to slot boundaries.
 * The opposite edge is fixed, so this changes the duration rather than moving
 * the event. Never shrinks the event past `MIN_EVENT_MINUTES`.
 */
export function resizeEvent(event: IEvent, edge: 'start' | 'end', deltaMinutes: number): IEvent {
	const start = parseISO(event.startDate);
	const end = parseISO(event.endDate);
	const delta = snapToSlot(deltaMinutes);

	if (edge === 'start') {
		const maxDelta = differenceInMinutes(end, start) - MIN_EVENT_MINUTES;
		const startDate = addMinutes(start, Math.min(delta, maxDelta));
		return { ...event, startDate: startDate.toISOString() };
	}

	const minDelta = MIN_EVENT_MINUTES - differenceInMinutes(end, start);
	const endDate = addMinutes(end, Math.max(delta, minDelta));
	return { ...event, endDate: endDate.toISOString() };
}
