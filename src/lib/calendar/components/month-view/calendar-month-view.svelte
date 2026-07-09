<script lang="ts">
	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import DayCell from './day-cell.svelte';

	import { getCalendarCells, calculateMonthEventPositions } from '../../helpers';

	import type { IEvent } from '../../interfaces';

	let { singleDayEvents, multiDayEvents }: { singleDayEvents: IEvent[]; multiDayEvents: IEvent[] } =
		$props();

	const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const calendar = getCalendarState();

	const allEvents = $derived([...multiDayEvents, ...singleDayEvents]);
	const cells = $derived(getCalendarCells(calendar.selectedDate));
	const eventPositions = $derived(
		calculateMonthEventPositions(multiDayEvents, singleDayEvents, calendar.selectedDate)
	);
</script>

<div>
	<div class="grid grid-cols-7 divide-x">
		{#each WEEK_DAYS as day (day)}
			<div class="flex items-center justify-center py-2">
				<span class="text-muted-foreground text-xs font-medium">{day}</span>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-7 overflow-hidden">
		{#each cells as cell (cell.date.toISOString())}
			<DayCell {cell} events={allEvents} {eventPositions} />
		{/each}
	</div>
</div>
