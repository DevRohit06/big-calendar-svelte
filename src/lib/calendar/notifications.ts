import { toast } from 'svelte-sonner';

import type { CalendarState } from './contexts/calendar-context.svelte';

/**
 * Announces a mutation and offers to take it back.
 *
 * The store deliberately knows nothing about toasts — `#mutate` is a data door,
 * not a UI one — so the announcement is raised here, by the components that
 * mutate. Every one of them goes through `#mutate`, which snapshots the whole
 * event array, so a single `undo()` reverses the change no matter which door
 * it came through: a drag, a resize, a dialog, or a delete.
 */
export function toastMutation(calendar: CalendarState, message: string) {
	toast(message, {
		action: {
			label: 'Undo',
			onClick: () => calendar.undo()
		}
	});
}
