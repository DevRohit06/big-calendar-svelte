<script lang="ts">
	import { parseISO, isWithinInterval, differenceInDays, startOfDay, endOfDay } from 'date-fns';

	import MonthEventBadge from '../month-view/month-event-badge.svelte';

	import type { IEvent } from '../../interfaces';

	let { selectedDate, multiDayEvents }: { selectedDate: Date; multiDayEvents: IEvent[] } = $props();

	const dayStart = $derived(startOfDay(selectedDate));
	const dayEnd = $derived(endOfDay(selectedDate));

	const multiDayEventsInDay = $derived(
		multiDayEvents
			.filter((event) => {
				const eventStart = parseISO(event.startDate);
				const eventEnd = parseISO(event.endDate);

				return (
					isWithinInterval(dayStart, { start: eventStart, end: eventEnd }) ||
					isWithinInterval(dayEnd, { start: eventStart, end: eventEnd }) ||
					(eventStart <= dayStart && eventEnd >= dayEnd)
				);
			})
			.sort((a, b) => {
				const durationA = differenceInDays(parseISO(a.endDate), parseISO(a.startDate));
				const durationB = differenceInDays(parseISO(b.endDate), parseISO(b.startDate));
				return durationB - durationA;
			})
	);
</script>

{#if multiDayEventsInDay.length > 0}
	<div class="flex border-b">
		<div class="w-18"></div>
		<div class="flex flex-1 flex-col gap-1 border-l py-1">
			{#each multiDayEventsInDay as event (event.id)}
				{@const eventStart = startOfDay(parseISO(event.startDate))}
				{@const eventEnd = startOfDay(parseISO(event.endDate))}
				{@const currentDate = startOfDay(selectedDate)}
				<MonthEventBadge
					{event}
					cellDate={selectedDate}
					eventCurrentDay={differenceInDays(currentDate, eventStart) + 1}
					eventTotalDays={differenceInDays(eventEnd, eventStart) + 1}
				/>
			{/each}
		</div>
	</div>
{/if}
