<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { isToday } from 'date-fns';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import { cn } from '$lib/utils';

	import type { IEvent } from '../../interfaces';
	import type { TEventColor } from '../../types';

	let { day, date, events }: { day: number; date: Date; events: IEvent[] } = $props();

	const MAX_INDICATORS = 3;

	const calendar = getCalendarState();

	const dotColors: Record<TEventColor, string> = {
		blue: 'bg-blue-600',
		green: 'bg-green-600',
		red: 'bg-red-600',
		yellow: 'bg-yellow-600',
		purple: 'bg-purple-600',
		orange: 'bg-orange-600',
		gray: 'bg-neutral-600'
	};

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

	{#if events.length > 0}
		<div class="mt-0.5 flex gap-0.5">
			{#if events.length <= MAX_INDICATORS}
				{#each events as event (event.id)}
					<div class={cn('size-1.5 rounded-full', dotColors[event.color])}></div>
				{/each}
			{:else}
				<div class={cn('size-1.5 rounded-full', dotColors[events[0].color])}></div>
				<span class="text-muted-foreground text-[7px]">+{events.length - 1}</span>
			{/if}
		</div>
	{/if}
</button>
