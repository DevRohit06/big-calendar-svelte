<script lang="ts">
	import { differenceInDays, format, parseISO, startOfDay } from 'date-fns';

	import AgendaEventCard from './agenda-event-card.svelte';

	import type { IEvent } from '../../interfaces';

	let { date, events, multiDayEvents }: { date: Date; events: IEvent[]; multiDayEvents: IEvent[] } =
		$props();

	const sortedEvents = $derived(
		[...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
	);
</script>

<div class="space-y-4">
	<div class="bg-background sticky top-0 flex items-center gap-4 py-2">
		<p class="text-sm font-semibold">{format(date, 'EEEE, MMMM d, yyyy')}</p>
	</div>

	<div class="space-y-2">
		{#each multiDayEvents as event (event.id)}
			{@const eventStart = startOfDay(parseISO(event.startDate))}
			{@const eventEnd = startOfDay(parseISO(event.endDate))}
			{@const currentDate = startOfDay(date)}
			<AgendaEventCard
				{event}
				eventCurrentDay={differenceInDays(currentDate, eventStart) + 1}
				eventTotalDays={differenceInDays(eventEnd, eventStart) + 1}
			/>
		{/each}

		{#each sortedEvents as event (event.id)}
			<AgendaEventCard {event} />
		{/each}
	</div>
</div>
