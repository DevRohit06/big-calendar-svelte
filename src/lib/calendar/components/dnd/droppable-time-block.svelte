<script lang="ts">
	import type { Snippet } from 'svelte';

	// TODO(dnd): accept dropped events at this date/hour/minute.
	/* eslint-disable @typescript-eslint/no-unused-vars */
	let {
		date,
		hour,
		minute,
		children
	}: { date: Date; hour: number; minute: number; children: Snippet } = $props();
	/* eslint-enable @typescript-eslint/no-unused-vars */
</script>

<div class="h-[24px]">
	{@render children()}
</div>
