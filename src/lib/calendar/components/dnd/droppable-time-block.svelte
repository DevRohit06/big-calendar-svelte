<script lang="ts">
	import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
	import type { Snippet } from 'svelte';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';
	import { isEventDragData, moveEventToTime } from './dnd';

	import { cn } from '$lib/utils';

	let {
		date,
		hour,
		minute,
		children
	}: { date: Date; hour: number; minute: number; children: Snippet } = $props();

	const calendar = getCalendarState();

	let isOver = $state(false);

	function dropTarget(element: HTMLElement) {
		return dropTargetForElements({
			element,
			canDrop: ({ source }) => isEventDragData(source.data),
			onDragEnter: () => (isOver = true),
			onDragLeave: () => (isOver = false),
			onDrop: ({ source }) => {
				isOver = false;
				if (!isEventDragData(source.data)) return;
				calendar.updateEvent(moveEventToTime(source.data.event, date, hour, minute));
			}
		});
	}
</script>

<div {@attach dropTarget} class={cn('h-[24px]', isOver && 'bg-primary/20')}>
	{@render children()}
</div>
