import { z } from 'zod';

export const eventSchema = z
	.object({
		user: z.string(),
		title: z.string().min(1, 'Title is required'),
		description: z.string().min(1, 'Description is required'),
		startDate: z.date({ error: 'Start date is required' }),
		startTime: z.object(
			{ hour: z.number(), minute: z.number() },
			{ error: 'Start time is required' }
		),
		endDate: z.date({ error: 'End date is required' }),
		endTime: z.object({ hour: z.number(), minute: z.number() }, { error: 'End time is required' }),
		color: z.enum(['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'gray'], {
			error: 'Color is required'
		}),
		// A single flat shape keeps the form bindings stable across the online/
		// physical toggle. `type` discriminates which field matters; the other is
		// ignored and stripped on submit. Location is optional overall — an empty
		// url/address simply means "no location", which is why neither field is
		// `.min(1)` required here.
		location: z
			.object({
				type: z.enum(['online', 'physical']).default('online'),
				url: z.string().default(''),
				address: z.string().default('')
			})
			.default({ type: 'online', url: '', address: '' })
	})
	.refine(
		(data) => {
			// Only validate the link's shape, and only when the user actually typed
			// one for an online location. Empty = no location = valid.
			const loc = data.location;
			if (loc.type !== 'online' || !loc.url.trim()) return true;
			try {
				return /^https?:$/.test(new URL(loc.url.trim()).protocol);
			} catch {
				return false;
			}
		},
		{
			error: 'Enter a valid meeting link (https://…)',
			path: ['location', 'url']
		}
	)
	.refine(
		(data) => {
			const startDateTime = new Date(data.startDate);
			startDateTime.setHours(data.startTime.hour, data.startTime.minute, 0, 0);

			const endDateTime = new Date(data.endDate);
			endDateTime.setHours(data.endTime.hour, data.endTime.minute, 0, 0);

			return startDateTime < endDateTime;
		},
		{
			error: 'Start date cannot be after end date',
			path: ['startDate']
		}
	);

export type TEventFormData = z.infer<typeof eventSchema>;
