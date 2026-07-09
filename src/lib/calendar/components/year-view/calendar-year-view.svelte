<script lang="ts">
	import { addMonths, startOfYear } from 'date-fns';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import YearViewMonth from './year-view-month.svelte';

	import type { IEvent } from '../../interfaces';

	let { allEvents }: { allEvents: IEvent[] } = $props();

	const calendar = getCalendarState();

	const months = $derived.by(() => {
		const yearStart = startOfYear(calendar.selectedDate);
		return Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
	});
</script>

<div class="p-4">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each months as month (month.toString())}
			<YearViewMonth {month} events={allEvents} />
		{/each}
	</div>
</div>
