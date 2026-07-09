<script lang="ts">
	import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
	import type { Snippet } from 'svelte';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';
	import { isEventDragData, moveEventToDay } from './dnd';

	import { cn } from '$lib/utils';

	import type { ICalendarCell } from '../../interfaces';

	let { cell, children }: { cell: ICalendarCell; children: Snippet } = $props();

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
				calendar.updateEvent(moveEventToDay(source.data.event, cell.date));
			}
		});
	}
</script>

<div {@attach dropTarget} class={cn(isOver && 'bg-accent/50')}>
	{@render children()}
</div>
