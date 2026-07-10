<script lang="ts">
	import './layout.css';

	import { ModeWatcher } from 'mode-watcher';

	import favicon from '$lib/assets/favicon.svg';
	import CalendarProvider from '$lib/calendar/contexts/calendar-provider.svelte';

	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />

<CalendarProvider>
	<div class="mx-auto flex max-w-[90rem] flex-col gap-4 px-8 py-4">
		{@render children()}
	</div>
</CalendarProvider>
