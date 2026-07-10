<script lang="ts">
	import { format } from 'date-fns';

	import { createDragTimes } from './dnd';

	import type { CreateDrag } from './create-drag.svelte';

	let {
		createDrag,
		date,
		dayKey,
		fromHour,
		toHour
	}: {
		createDrag: CreateDrag;
		date: Date;
		dayKey: string;
		fromHour: number;
		toHour: number;
	} = $props();

	// Only the column the gesture started in paints a preview.
	const showing = $derived(createDrag.dayKey === dayKey);

	// Percentages, to match how `getEventBlockStyle` positions real event blocks
	// inside this same column.
	const span = $derived((toHour - fromHour) * 60);
	const top = $derived(((createDrag.fromMinutes - fromHour * 60) / span) * 100);
	const height = $derived(((createDrag.toMinutes - createDrag.fromMinutes) / span) * 100);

	const label = $derived.by(() => {
		const { start, end } = createDragTimes(date, createDrag.fromMinutes, createDrag.toMinutes);
		return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
	});
</script>

{#if showing}
	<!-- Transparent to the pointer, so the drag keeps reading the grid beneath it. -->
	<div
		class="pointer-events-none absolute inset-x-0 z-10 p-1"
		style="top: {top}%; height: {height}%"
	>
		<div
			class="border-primary bg-primary/20 text-primary flex h-full flex-col justify-center overflow-hidden rounded-md border px-2 text-xs font-semibold"
		>
			<span class="truncate">New event</span>
			<span class="truncate font-medium">{label}</span>
		</div>
	</div>
{/if}
