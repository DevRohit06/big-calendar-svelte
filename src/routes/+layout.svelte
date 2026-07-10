<script lang="ts">
	import './layout.css';

	import { ModeWatcher } from 'mode-watcher';

	import favicon from '$lib/assets/favicon.svg';
	import CalendarProvider from '$lib/calendar/contexts/calendar-provider.svelte';
	import KeyboardShortcuts from '$lib/calendar/components/keyboard-shortcuts.svelte';
	import CommandPalette from '$lib/calendar/components/command-palette.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />
<Toaster />

<CalendarProvider>
	<!-- Both read the calendar context, so they live inside the provider. -->
	<KeyboardShortcuts />
	<CommandPalette />

	<div class="mx-auto flex max-w-[90rem] flex-col gap-4 px-8 py-4">
		{@render children()}
	</div>
</CalendarProvider>
