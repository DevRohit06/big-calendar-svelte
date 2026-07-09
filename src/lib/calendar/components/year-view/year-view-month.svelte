<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { format, isSameDay, parseISO, getDaysInMonth, startOfMonth } from 'date-fns';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import YearViewDayCell from './year-view-day-cell.svelte';

	import type { IEvent } from '../../interfaces';

	let { month, events }: { month: Date; events: IEvent[] } = $props();

	const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const calendar = getCalendarState();

	const monthName = $derived(format(month, 'MMMM'));

	const daysInMonth = $derived.by(() => {
		const totalDays = getDaysInMonth(month);
		const firstDay = startOfMonth(month).getDay();

		const days: (number | null)[] = Array.from({ length: totalDays }, (_, i) => i + 1);
		const blanks: (number | null)[] = Array(firstDay).fill(null);

		return [...blanks, ...days];
	});

	function eventsForDate(date: Date) {
		return events.filter(
			(event) =>
				isSameDay(parseISO(event.startDate), date) || isSameDay(parseISO(event.endDate), date)
		);
	}

	function handleClick() {
		calendar.selectDate(new Date(month.getFullYear(), month.getMonth(), 1));
		goto(resolve('/month-view'));
	}
</script>

<div class="flex flex-col">
	<button
		type="button"
		onclick={handleClick}
		class="hover:bg-accent focus-visible:ring-ring w-full rounded-t-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-1"
	>
		{monthName}
	</button>

	<div class="flex-1 space-y-2 rounded-b-lg border border-t-0 p-3">
		<div class="grid grid-cols-7 gap-x-0.5 text-center">
			{#each WEEK_DAYS as day (day)}
				<div class="text-muted-foreground text-xs font-medium">{day}</div>
			{/each}
		</div>

		<div class="grid grid-cols-7 gap-x-0.5 gap-y-2">
			{#each daysInMonth as day, index (index)}
				{#if day === null}
					<div class="h-10"></div>
				{:else}
					{@const date = new Date(month.getFullYear(), month.getMonth(), day)}
					<YearViewDayCell {day} {date} events={eventsForDate(date)} />
				{/if}
			{/each}
		</div>
	</div>
</div>
