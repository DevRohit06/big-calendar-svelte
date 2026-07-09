<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { isToday, startOfDay } from 'date-fns';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import EventBullet from './event-bullet.svelte';
	import DroppableDayCell from '../dnd/droppable-day-cell.svelte';
	import MonthEventBadge from './month-event-badge.svelte';

	import { cn } from '$lib/utils';
	import { getMonthCellEvents } from '../../helpers';

	import type { ICalendarCell, IEvent } from '../../interfaces';

	let {
		cell,
		events,
		eventPositions
	}: { cell: ICalendarCell; events: IEvent[]; eventPositions: Record<string, number> } = $props();

	const MAX_VISIBLE_EVENTS = 3;

	const calendar = getCalendarState();

	const cellEvents = $derived(getMonthCellEvents(cell.date, events, eventPositions));
	const isSunday = $derived(cell.date.getDay() === 0);

	function handleClick() {
		calendar.selectDate(cell.date);
		goto(resolve('/day-view'));
	}
</script>

<DroppableDayCell {cell}>
	<div
		class={cn(
			'flex h-full flex-col gap-1 border-l border-t py-1.5 lg:pb-2 lg:pt-1',
			isSunday && 'border-l-0'
		)}
	>
		<button
			onclick={handleClick}
			class={cn(
				'flex size-6 translate-x-1 items-center justify-center rounded-full text-xs font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:px-2',
				!cell.currentMonth && 'opacity-20',
				isToday(cell.date) && 'bg-primary font-bold text-primary-foreground hover:bg-primary'
			)}
		>
			{cell.day}
		</button>

		<div
			class={cn(
				'flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0',
				!cell.currentMonth && 'opacity-50'
			)}
		>
			{#each [0, 1, 2] as position (position)}
				{@const event = cellEvents.find((e) => e.position === position)}
				<div class="lg:flex-1">
					{#if event}
						<EventBullet class="lg:hidden" color={event.color} />
						<MonthEventBadge class="hidden lg:flex" {event} cellDate={startOfDay(cell.date)} />
					{/if}
				</div>
			{/each}
		</div>

		{#if cellEvents.length > MAX_VISIBLE_EVENTS}
			<p
				class={cn(
					'h-4.5 px-1.5 text-xs font-semibold text-muted-foreground',
					!cell.currentMonth && 'opacity-50'
				)}
			>
				<span class="sm:hidden">+{cellEvents.length - MAX_VISIBLE_EVENTS}</span>
				<span class="hidden sm:inline"> {cellEvents.length - MAX_VISIBLE_EVENTS} more...</span>
			</p>
		{/if}
	</div>
</DroppableDayCell>
