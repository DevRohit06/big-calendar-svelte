<script lang="ts" module>
	import type { TEventColor } from '../types';

	const DOT_COLORS: Record<TEventColor, string> = {
		blue: 'bg-blue-600',
		green: 'bg-green-600',
		red: 'bg-red-600',
		yellow: 'bg-yellow-600',
		purple: 'bg-purple-600',
		orange: 'bg-orange-600',
		gray: 'bg-neutral-600'
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils';

	import type { IEvent } from '../interfaces';

	// Shared by the year view's day cells and the day view's mini calendar, so the
	// two never drift. Past three events a cell is too small for one dot each.
	const MAX_DOTS = 3;

	let { events, class: className }: { events: IEvent[]; class?: string } = $props();
</script>

{#if events.length > 0}
	<div class={cn('flex gap-0.5', className)}>
		{#if events.length <= MAX_DOTS}
			{#each events as event (event.id)}
				<div class={cn('size-1.5 rounded-full', DOT_COLORS[event.color])}></div>
			{/each}
		{:else}
			<div class={cn('size-1.5 rounded-full', DOT_COLORS[events[0].color])}></div>
			<span class="text-muted-foreground text-[7px] leading-none">+{events.length - 1}</span>
		{/if}
	</div>
{/if}
