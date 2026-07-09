<script lang="ts">
	import { resolve } from '$app/paths';
	import ColumnsIcon from '@lucide/svelte/icons/columns-2';
	import Grid3x3Icon from '@lucide/svelte/icons/grid-3x3';
	import ListIcon from '@lucide/svelte/icons/list';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Grid2x2Icon from '@lucide/svelte/icons/grid-2x2';
	import CalendarRangeIcon from '@lucide/svelte/icons/calendar-range';

	import { Button } from '$lib/components/ui/button';

	import UserSelect from './user-select.svelte';
	import TodayButton from './today-button.svelte';
	import DateNavigator from './date-navigator.svelte';
	import AddEventDialog from '../dialogs/add-event-dialog.svelte';

	import type { IEvent } from '../../interfaces';
	import type { TCalendarView } from '../../types';

	let { view, events }: { view: TCalendarView; events: IEvent[] } = $props();

	const VIEWS = [
		{
			key: 'day',
			href: '/day-view',
			label: 'View by day',
			icon: ListIcon,
			rounding: 'rounded-r-none'
		},
		{
			key: 'week',
			href: '/week-view',
			label: 'View by week',
			icon: ColumnsIcon,
			rounding: '-ml-px rounded-none'
		},
		{
			key: 'month',
			href: '/month-view',
			label: 'View by month',
			icon: Grid2x2Icon,
			rounding: '-ml-px rounded-none'
		},
		{
			key: 'year',
			href: '/year-view',
			label: 'View by year',
			icon: Grid3x3Icon,
			rounding: '-ml-px rounded-none'
		},
		{
			key: 'agenda',
			href: '/agenda-view',
			label: 'View by agenda',
			icon: CalendarRangeIcon,
			rounding: '-ml-px rounded-l-none'
		}
	] as const;
</script>

<div class="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
	<div class="flex items-center gap-3">
		<TodayButton />
		<DateNavigator {view} {events} />
	</div>

	<div class="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
		<div class="flex w-full items-center gap-1.5">
			<div class="inline-flex">
				{#each VIEWS as item (item.key)}
					{@const Icon = item.icon}
					<Button
						href={resolve(item.href)}
						aria-label={item.label}
						size="icon"
						variant={view === item.key ? 'default' : 'outline'}
						class="{item.rounding} [&_svg]:size-5"
					>
						<Icon strokeWidth={1.8} />
					</Button>
				{/each}
			</div>

			<UserSelect />
		</div>

		<AddEventDialog>
			{#snippet children(triggerProps)}
				<Button {...triggerProps} class="w-full sm:w-auto">
					<PlusIcon />
					Add Event
				</Button>
			{/snippet}
		</AddEventDialog>
	</div>
</div>
