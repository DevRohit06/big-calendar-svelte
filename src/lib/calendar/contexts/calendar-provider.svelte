<script lang="ts">
	import { setCalendarState } from './calendar-context.svelte';
	import { getEvents, getUsers } from '../requests';
	import { loadEvents, saveEvents } from '../storage';

	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const calendar = setCalendarState([]);

	// Runs in the browser only, so it is safe to touch localStorage and the
	// randomised mocks here. Stored events win; the mocks are the first-visit seed.
	$effect(() => {
		let cancelled = false;

		(async () => {
			const [users, mocks] = await Promise.all([getUsers(), getEvents()]);
			if (cancelled) return;

			calendar.users = users;

			const stored = loadEvents();
			calendar.hydrate(stored ?? mocks);

			// Pin the seed on a first visit. The mocks re-randomise on every module
			// load, so without this a plain reload would hand the visitor a
			// different calendar until they happened to change something.
			if (!stored) saveEvents(mocks);
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

{@render children()}
