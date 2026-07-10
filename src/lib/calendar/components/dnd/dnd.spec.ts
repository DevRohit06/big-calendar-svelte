import { describe, expect, it } from 'vitest';
import { differenceInMinutes, parseISO } from 'date-fns';

import {
	createDragRange,
	createDragTimes,
	moveEventToDay,
	moveEventToTime,
	resizeEvent,
	slotFromOffset,
	slotMinutes,
	snapToSlot
} from './dnd';

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

describe('slotMinutes', () => {
	it('counts minutes from midnight', () => {
		expect(slotMinutes(0, 0)).toBe(0);
		expect(slotMinutes(9, 30)).toBe(570);
		expect(slotMinutes(23, 45)).toBe(1425);
	});
});

describe('createDragRange', () => {
	it('covers the slot under the pointer, so a drag within one slot is 15 minutes', () => {
		expect(createDragRange(600, 600)).toEqual({ from: 600, to: 615 });
	});

	it('spans from the anchor to the far edge of the pointer slot', () => {
		// 10:00 -> 11:15 slot means an event of 10:00-11:30.
		expect(createDragRange(600, 675)).toEqual({ from: 600, to: 690 });
	});

	it('treats an upward drag the same as a downward one', () => {
		expect(createDragRange(675, 600)).toEqual({ from: 600, to: 690 });
	});
});

describe('slotFromOffset', () => {
	// A 07:00-19:00 column, one hour per 96px.
	const height = 12 * 96;

	it('maps the top of the column to its first slot', () => {
		expect(slotFromOffset(0, height, 7, 19)).toBe(7 * 60);
	});

	it('floors to the containing slot rather than rounding to the nearest', () => {
		// 14px past 07:00 is 08:45 + a sliver; it belongs to the 08:45 slot.
		expect(slotFromOffset(96 + 72 + 14, height, 7, 19)).toBe(8 * 60 + 45);
	});

	it('clamps a pointer dragged above the column to the first slot', () => {
		expect(slotFromOffset(-500, height, 7, 19)).toBe(7 * 60);
	});

	it('clamps a pointer dragged below the column to the last real slot', () => {
		expect(slotFromOffset(height + 500, height, 7, 19)).toBe(19 * 60 - 15);
	});

	it('survives a zero-height column instead of dividing by zero', () => {
		expect(slotFromOffset(40, 0, 7, 19)).toBe(7 * 60);
	});
});

describe('createDragTimes', () => {
	it('anchors the range to the given day', () => {
		const { start: from, end: to } = createDragTimes(new Date(2026, 6, 10, 17, 3), 600, 690);

		expect(from.getHours()).toBe(10);
		expect(from.getMinutes()).toBe(0);
		expect(to.getHours()).toBe(11);
		expect(to.getMinutes()).toBe(30);
		expect(from.getDate()).toBe(10);
	});

	it('rolls an end of 1440 over to midnight of the next day', () => {
		const { end } = createDragTimes(new Date(2026, 6, 10), 1425, 1440);

		expect(end.getDate()).toBe(11);
		expect(end.getHours()).toBe(0);
		expect(end.getMinutes()).toBe(0);
	});
});
