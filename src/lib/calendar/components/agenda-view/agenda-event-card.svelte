<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const agendaEventCardVariants = tv({
		base: 'flex select-none items-center justify-between gap-3 rounded-md border p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
		variants: {
			color: {
				// Colored variants
				blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 [&_.event-dot]:fill-blue-600',
				green:
					'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300 [&_.event-dot]:fill-green-600',
				red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 [&_.event-dot]:fill-red-600',
				yellow:
					'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 [&_.event-dot]:fill-yellow-600',
				purple:
					'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 [&_.event-dot]:fill-purple-600',
				orange:
					'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 [&_.event-dot]:fill-orange-600',
				gray: 'border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 [&_.event-dot]:fill-neutral-600',

				// Dot variants
				'blue-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-blue-600',
				'green-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-green-600',
				'red-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-red-600',
				'orange-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-orange-600',
				'purple-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-purple-600',
				'yellow-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-yellow-600',
				'gray-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-neutral-600'
			}
		},
		defaultVariants: {
			color: 'blue-dot'
		}
	});

	type CardColor = VariantProps<typeof agendaEventCardVariants>['color'];
</script>

<script lang="ts">
	import { format, parseISO } from 'date-fns';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import TextIcon from '@lucide/svelte/icons/text-align-start';
	import UserIcon from '@lucide/svelte/icons/user';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import EventDetailsDialog from '../dialogs/event-details-dialog.svelte';

	import type { IEvent } from '../../interfaces';

	let {
		event,
		eventCurrentDay,
		eventTotalDays
	}: { event: IEvent; eventCurrentDay?: number; eventTotalDays?: number } = $props();

	const calendar = getCalendarState();

	const startDate = $derived(parseISO(event.startDate));
	const endDate = $derived(parseISO(event.endDate));

	const color = $derived(
		(calendar.badgeVariant === 'dot' ? `${event.color}-dot` : event.color) as CardColor
	);
</script>

<EventDetailsDialog {event}>
	{#snippet children(triggerProps)}
		<div {...triggerProps} role="button" tabindex={0} class={agendaEventCardVariants({ color })}>
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-1.5">
					{#if ['mixed', 'dot'].includes(calendar.badgeVariant)}
						<svg width="8" height="8" viewBox="0 0 8 8" class="event-dot shrink-0">
							<circle cx="4" cy="4" r="4" />
						</svg>
					{/if}

					<p class="font-medium">
						{#if eventCurrentDay && eventTotalDays}
							<span class="mr-1 text-xs">Day {eventCurrentDay} of {eventTotalDays} • </span>
						{/if}
						{event.title}
					</p>
				</div>

				<div class="mt-1 flex items-center gap-1">
					<UserIcon class="size-3 shrink-0" />
					<p class="text-foreground text-xs">{event.user.name}</p>
				</div>

				<div class="flex items-center gap-1">
					<ClockIcon class="size-3 shrink-0" />
					<p class="text-foreground text-xs">
						{format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
					</p>
				</div>

				<div class="flex items-center gap-1">
					<TextIcon class="size-3 shrink-0" />
					<p class="text-foreground text-xs">{event.description}</p>
				</div>
			</div>
		</div>
	{/snippet}
</EventDetailsDialog>
