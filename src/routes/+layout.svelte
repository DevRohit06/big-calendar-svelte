<script lang="ts">
	import './layout.css';

	import { ModeWatcher } from 'mode-watcher';

	import favicon from '$lib/assets/favicon.svg';
	import CalendarProvider from '$lib/calendar/contexts/calendar-provider.svelte';
	import KeyboardShortcuts from '$lib/calendar/components/keyboard-shortcuts.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />
<Toaster />

<CalendarProvider>
	<!-- Reads the calendar context, so it lives inside the provider. -->
	<KeyboardShortcuts />

	<div class="mx-auto flex max-w-[90rem] flex-col gap-4 px-8 py-4">
		{@render children()}
	</div>
</CalendarProvider>
