<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ICalendarCell } from '../../interfaces';

	// TODO(dnd): accept dropped events and call `calendar.updateEvent`.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { cell, children }: { cell: ICalendarCell; children: Snippet } = $props();
</script>

<div>
	{@render children()}
</div>
