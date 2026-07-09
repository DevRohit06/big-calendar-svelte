<script lang="ts">
	import { setCalendarState } from './calendar-context.svelte';

	import type { Snippet } from 'svelte';
	import type { IEvent, IUser } from '../interfaces';

	let { users, events, children }: { users: IUser[]; events: IEvent[]; children: Snippet } =
		$props();

	// Seeds the store once, mirroring the React provider's `useState(events)`.
	// Later prop changes are ignored; the store owns the events from here on.
	// svelte-ignore state_referenced_locally
	setCalendarState(users, events);
</script>

{@render children()}
