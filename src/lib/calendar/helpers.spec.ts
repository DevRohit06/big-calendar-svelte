import { describe, expect, it } from 'vitest';

import { getVisibleHours, normalizeHourRange } from './helpers';

describe('normalizeHourRange', () => {
	it('leaves a valid range untouched', () => {
		expect(normalizeHourRange({ from: 7, to: 18 }, 'from')).toEqual({ from: 7, to: 18 });
		expect(normalizeHourRange({ from: 7, to: 18 }, 'to')).toEqual({ from: 7, to: 18 });
	});

	it('reads midnight as end of day', () => {
		expect(normalizeHourRange({ from: 9, to: 0 }, 'to')).toEqual({ from: 9, to: 24 });
	});

	it('pushes `to` out when the edited `from` would invert the range', () => {
		expect(normalizeHourRange({ from: 18, to: 7 }, 'from')).toEqual({ from: 18, to: 19 });
	});

	it('pulls `from` back when the edited `to` would invert the range', () => {
		expect(normalizeHourRange({ from: 18, to: 7 }, 'to')).toEqual({ from: 6, to: 7 });
	});

	it('never lets the two edges collide', () => {
		expect(normalizeHourRange({ from: 9, to: 9 }, 'from')).toEqual({ from: 9, to: 10 });
		expect(normalizeHourRange({ from: 9, to: 9 }, 'to')).toEqual({ from: 8, to: 9 });
	});

	it('clamps to the bounds of a day', () => {
		expect(normalizeHourRange({ from: 23, to: 23 }, 'from')).toEqual({ from: 23, to: 24 });
	});

	it('treats midnight-to-midnight as the whole day', () => {
		expect(normalizeHourRange({ from: 0, to: 0 }, 'to')).toEqual({ from: 0, to: 24 });
	});
});

describe('getVisibleHours', () => {
	it('builds an empty grid from an inverted range — the bug normalizeHourRange prevents', () => {
		expect(getVisibleHours({ from: 18, to: 7 }, []).hours).toEqual([]);
	});

	it('builds a full grid from any range normalizeHourRange can produce', () => {
		for (const edited of ['from', 'to'] as const) {
			const range = normalizeHourRange({ from: 18, to: 7 }, edited);
			expect(getVisibleHours(range, []).hours.length).toBeGreaterThan(0);
		}
	});
});
