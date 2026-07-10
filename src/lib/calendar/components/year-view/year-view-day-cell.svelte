<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { isToday } from 'date-fns';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import EventDots from '../event-dots.svelte';

	import { cn } from '$lib/utils';

	import type { IEvent } from '../../interfaces';

	let { day, date, events }: { day: number; date: Date; events: IEvent[] } = $props();

	const calendar = getCalendarState();

	function handleClick() {
		calendar.selectDate(date);
		goto(resolve('/day-view'));
	}
</script>

<button
	onclick={handleClick}
	type="button"
	class="hover:bg-accent focus-visible:ring-ring flex h-11 flex-1 flex-col items-center justify-start gap-0.5 rounded-md pt-1 focus-visible:outline-none focus-visible:ring-1"
>
	<div
		class={cn(
			'flex size-6 items-center justify-center rounded-full text-xs font-medium',
			isToday(date) && 'bg-primary text-primary-foreground font-semibold'
		)}
	>
		{day}
	</div>

	<EventDots {events} class="mt-0.5" />
</button>
