import { describe, expect, it } from 'vitest';
import { differenceInMinutes, parseISO } from 'date-fns';

import { moveEventToDay, moveEventToTime, resizeEvent, snapToSlot } from './dnd';

import type { IEvent } from '../../interfaces';

/** Built from local-time parts so the assertions hold in any timezone. */
function makeEvent(start: Date, durationMinutes: number): IEvent {
	return {
		id: 1,
		title: 'Standup',
		description: '',
		color: 'blue',
		startDate: start.toISOString(),
		endDate: new Date(start.getTime() + durationMinutes * 60_000).toISOString(),
		user: { id: 'u1', name: 'Ada', picturePath: null }
	};
}

const start = () => new Date(2026, 6, 10, 9, 30);
const duration = (event: IEvent) =>
	differenceInMinutes(parseISO(event.endDate), parseISO(event.startDate));

describe('snapToSlot', () => {
	it('rounds to the nearest quarter hour', () => {
		expect(snapToSlot(7)).toBe(0);
		expect(snapToSlot(8)).toBe(15);
		expect(snapToSlot(-8)).toBe(-15);
		expect(snapToSlot(52)).toBe(45);
	});
});

describe('moveEventToDay', () => {
	it('changes the day, keeping time of day and duration', () => {
		const event = makeEvent(start(), 90);
		const moved = moveEventToDay(event, new Date(2026, 6, 15));
		const movedStart = parseISO(moved.startDate);

		expect(movedStart.getDate()).toBe(15);
		expect(movedStart.getHours()).toBe(9);
		expect(movedStart.getMinutes()).toBe(30);
		expect(duration(moved)).toBe(90);
	});

	it('carries a multi-day event across the month boundary intact', () => {
		const event = makeEvent(new Date(2026, 6, 30, 9, 0), 60 * 48);
		const moved = moveEventToDay(event, new Date(2026, 7, 30));

		expect(parseISO(moved.endDate).getMonth()).toBe(8); // September
		expect(duration(moved)).toBe(60 * 48);
	});
});

describe('moveEventToTime', () => {
	it('sets the day and time of day, keeping duration', () => {
		const event = makeEvent(start(), 45);
		const moved = moveEventToTime(event, new Date(2026, 6, 12), 14, 15);
		const movedStart = parseISO(moved.startDate);

		expect(movedStart.getDate()).toBe(12);
		expect(movedStart.getHours()).toBe(14);
		expect(movedStart.getMinutes()).toBe(15);
		expect(duration(moved)).toBe(45);
	});
});

describe('resizeEvent', () => {
	it('drags the end edge, snapping to the nearest slot', () => {
		const resized = resizeEvent(makeEvent(start(), 60), 'end', 20);

		expect(duration(resized)).toBe(75);
		expect(resized.startDate).toBe(makeEvent(start(), 60).startDate);
	});

	it('drags the start edge, leaving the end fixed', () => {
		const event = makeEvent(start(), 60);
		const resized = resizeEvent(event, 'start', -30);

		expect(parseISO(resized.startDate).getMinutes()).toBe(0);
		expect(resized.endDate).toBe(event.endDate);
		expect(duration(resized)).toBe(90);
	});

	it('will not shrink an event below one slot from either edge', () => {
		expect(duration(resizeEvent(makeEvent(start(), 30), 'end', -120))).toBe(15);
		expect(duration(resizeEvent(makeEvent(start(), 30), 'start', 120))).toBe(15);
	});

	it('allows an event to be shrunk to exactly one slot', () => {
		expect(duration(resizeEvent(makeEvent(start(), 30), 'end', -15))).toBe(15);
	});
});
