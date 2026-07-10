import { addMinutes, differenceInMinutes, parseISO, set, startOfDay } from 'date-fns';

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

/** Minutes past midnight for a grid slot. */
export function slotMinutes(hour: number, minute: number) {
	return hour * 60 + minute;
}

/**
 * The minute range a create-drag covers, from the slot it began on to the slot
 * under the pointer. The far slot is inclusive, so a drag that never leaves its
 * starting slot still yields one slot's worth of event; and dragging upward is
 * the same gesture as dragging downward.
 */
export function createDragRange(anchorMinutes: number, pointerMinutes: number) {
	return {
		from: Math.min(anchorMinutes, pointerMinutes),
		to: Math.max(anchorMinutes, pointerMinutes) + SLOT_MINUTES
	};
}

/**
 * Which slot a pointer sitting `offsetY` down a day column has landed on.
 *
 * Geometry rather than `document.elementFromPoint`: for most of a drag the
 * pointer is over an event block or over the drag's own preview, neither of
 * which is a slot, and a hit test would stall on the last slot it saw. Clamped,
 * so dragging off the top or bottom of the column parks on a real slot instead
 * of running off into negative minutes.
 */
export function slotFromOffset(
	offsetY: number,
	columnHeight: number,
	fromHour: number,
	toHour: number
) {
	const firstMinute = fromHour * 60;
	const lastMinute = toHour * 60;

	if (columnHeight <= 0) return firstMinute;

	const raw = firstMinute + (offsetY / columnHeight) * (lastMinute - firstMinute);
	const clamped = Math.min(Math.max(raw, firstMinute), lastMinute - SLOT_MINUTES);

	return Math.floor(clamped / SLOT_MINUTES) * SLOT_MINUTES;
}

/**
 * Turns a create-drag's minute range into real times on `day`. A drag ending in
 * the last slot of the day runs `to` up to 1440, which lands on midnight of the
 * following day — exactly what an event ending at midnight should say.
 */
export function createDragTimes(day: Date, fromMinutes: number, toMinutes: number) {
	const midnight = startOfDay(day);

	return {
		start: addMinutes(midnight, fromMinutes),
		end: addMinutes(midnight, toMinutes)
	};
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
