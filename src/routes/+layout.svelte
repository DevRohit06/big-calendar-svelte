<script lang="ts">
	import './layout.css';

	import favicon from '$lib/assets/favicon.svg';
	import CalendarProvider from '$lib/calendar/contexts/calendar-provider.svelte';

	import type { Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';

	let { data, children }: { data: LayoutServerData; children: Snippet } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<CalendarProvider users={data.users} events={data.events}>
	<div class="mx-auto flex max-w-[90rem] flex-col gap-4 px-8 py-4">
		{@render children()}
	</div>
</CalendarProvider>
