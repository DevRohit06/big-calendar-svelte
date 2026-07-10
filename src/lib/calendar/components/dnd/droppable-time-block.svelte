<script lang="ts">
	import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
	import { format } from 'date-fns';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';
	import { toastMutation } from '../../notifications';
	import { createDragTimes, isEventDragData, moveEventToTime, slotMinutes } from './dnd';

	import type { CreateDrag } from './create-drag.svelte';

	import { cn } from '$lib/utils';

	let {
		date,
		hour,
		minute,
		createDrag,
		fromHour,
		toHour
	}: {
		date: Date;
		hour: number;
		minute: number;
		createDrag: CreateDrag;
		fromHour: number;
		toHour: number;
	} = $props();

	const calendar = getCalendarState();

	let isOver = $state(false);

	const minutes = $derived(slotMinutes(hour, minute));
	const label = $derived(format(createDragTimes(date, minutes, minutes).start, 'h:mm a, MMM d'));

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
				toastMutation(calendar, 'Event moved');
			}
		});
	}

	// Which gesture a pointerdown begins is settled by what sits under the pointer,
	// not by how far it later travels — no timers, no distance thresholds.
	//
	// Event blocks are absolutely positioned siblings stacked above these slots, so
	// a pointerdown on an event never reaches this handler: it starts a move-drag,
	// handled by Pragmatic. A pointerdown that DOES reach here landed on empty
	// grid, so it starts a create-drag. The two can never both claim one gesture.
	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 0) return;

		const column = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-day-column]');
		if (!column) return;

		// Suppresses the text selection that would otherwise smear down the grid.
		event.preventDefault();

		createDrag.start({
			day: date,
			dayKey: format(date, 'yyyy-MM-dd'),
			minutes,
			column,
			fromHour,
			toHour
		});
	}
</script>

<div
	{@attach dropTarget}
	onpointerdown={handlePointerDown}
	role="button"
	tabindex={-1}
	aria-label="Create an event at {label}"
	class={cn('hover:bg-accent h-[24px] cursor-pointer transition-colors', isOver && 'bg-primary/20')}
></div>
