import { describe, expect, it } from 'vitest';

import { decode, encode } from './storage';

import type { IEvent } from './interfaces';

const event: IEvent = {
	id: 1,
	title: 'Standup',
	description: '',
	color: 'blue',
	startDate: '2026-07-10T09:00:00.000Z',
	endDate: '2026-07-10T09:30:00.000Z',
	user: { id: 'u1', name: 'Ada', picturePath: null }
};

describe('encode / decode', () => {
	it('round-trips events', () => {
		expect(decode(encode([event]))).toEqual([event]);
	});

	it('returns null for absent storage', () => {
		expect(decode(null)).toBeNull();
	});

	it('returns null for corrupt JSON rather than throwing', () => {
		expect(decode('{not json')).toBeNull();
	});

	it('returns null for a future schema version', () => {
		expect(decode(JSON.stringify({ version: 999, events: [] }))).toBeNull();
	});

	it('returns null when events is not an array', () => {
		expect(decode(JSON.stringify({ version: 1, events: 'nope' }))).toBeNull();
	});
});
