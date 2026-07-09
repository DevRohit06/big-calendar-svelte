<script lang="ts">
	import CalendarX2Icon from '@lucide/svelte/icons/calendar-x-2';
	import { parseISO, format, endOfDay, startOfDay, isSameMonth } from 'date-fns';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import AgendaDayGroup from './agenda-day-group.svelte';

	import type { IEvent } from '../../interfaces';

	let { singleDayEvents, multiDayEvents }: { singleDayEvents: IEvent[]; multiDayEvents: IEvent[] } =
		$props();

	const calendar = getCalendarState();

	// The Map and Dates below are rebuilt from scratch on every recomputation and
	// never held as state, so the reactive variants would be pure overhead.
	/* eslint-disable svelte/prefer-svelte-reactivity */
	const eventsByDay = $derived.by(() => {
		const allDates = new Map<string, { date: Date; events: IEvent[]; multiDayEvents: IEvent[] }>();

		singleDayEvents.forEach((event) => {
			const eventDate = parseISO(event.startDate);
			if (!isSameMonth(eventDate, calendar.selectedDate)) return;

			const dateKey = format(eventDate, 'yyyy-MM-dd');

			if (!allDates.has(dateKey)) {
				allDates.set(dateKey, { date: startOfDay(eventDate), events: [], multiDayEvents: [] });
			}

			allDates.get(dateKey)?.events.push(event);
		});

		multiDayEvents.forEach((event) => {
			const eventStart = parseISO(event.startDate);
			const eventEnd = parseISO(event.endDate);

			let currentDate = startOfDay(eventStart);
			const lastDate = endOfDay(eventEnd);

			while (currentDate <= lastDate) {
				if (isSameMonth(currentDate, calendar.selectedDate)) {
					const dateKey = format(currentDate, 'yyyy-MM-dd');

					if (!allDates.has(dateKey)) {
						allDates.set(dateKey, { date: new Date(currentDate), events: [], multiDayEvents: [] });
					}

					allDates.get(dateKey)?.multiDayEvents.push(event);
				}
				currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
			}
		});

		return Array.from(allDates.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
	});
	/* eslint-enable svelte/prefer-svelte-reactivity */

	const hasAnyEvents = $derived(singleDayEvents.length > 0 || multiDayEvents.length > 0);
</script>

<div class="h-[800px]">
	<ScrollArea class="h-full" type="always">
		<div class="space-y-6 p-4">
			{#each eventsByDay as dayGroup (format(dayGroup.date, 'yyyy-MM-dd'))}
				<AgendaDayGroup
					date={dayGroup.date}
					events={dayGroup.events}
					multiDayEvents={dayGroup.multiDayEvents}
				/>
			{/each}

			{#if !hasAnyEvents}
				<div class="text-muted-foreground flex flex-col items-center justify-center gap-2 py-20">
					<CalendarX2Icon class="size-10" />
					<p class="text-sm md:text-base">No events scheduled for the selected month</p>
				</div>
			{/if}
		</div>
	</ScrollArea>
</div>
