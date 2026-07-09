import { describe, expect, it } from 'vitest';

import { MAX_HISTORY, createHistory, record, redo, undo } from './history';

describe('history', () => {
	it('undoes back to the previous snapshot', () => {
		const h = record(createHistory<number>(), 1);
		expect(undo(h, 2)).toMatchObject({ value: 1 });
	});

	it('returns null when there is nothing to undo', () => {
		expect(undo(createHistory<number>(), 1)).toBeNull();
		expect(redo(createHistory<number>(), 1)).toBeNull();
	});

	it('redoes what was just undone', () => {
		const recorded = record(createHistory<number>(), 1);
		const undone = undo(recorded, 2)!;
		expect(redo(undone.history, undone.value)).toMatchObject({ value: 2 });
	});

	it('clears the redo stack when a new snapshot is recorded', () => {
		const recorded = record(createHistory<number>(), 1);
		const undone = undo(recorded, 2)!;
		expect(record(undone.history, 5).redo).toEqual([]);
	});

	it('drops the oldest snapshot past the cap', () => {
		let h = createHistory<number>();
		for (let i = 0; i <= MAX_HISTORY; i++) h = record(h, i);

		expect(h.undo.length).toBe(MAX_HISTORY);
		expect(h.undo[0]).toBe(1); // 0 fell off the front
	});
});
