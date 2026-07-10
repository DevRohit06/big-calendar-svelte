<script lang="ts">
	import {
		startOfWeek,
		addDays,
		format,
		parseISO,
		isSameDay,
		areIntervalsOverlapping
	} from 'date-fns';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import AddEventDialog from '../dialogs/add-event-dialog.svelte';
	import EventBlock from './event-block.svelte';
	import DroppableTimeBlock from '../dnd/droppable-time-block.svelte';
	import CreateDragPreview from '../dnd/create-drag-preview.svelte';
	import { CreateDrag } from '../dnd/create-drag.svelte';
	import CalendarTimeline from './calendar-time-line.svelte';
	import WeekViewMultiDayEventsRow from './week-view-multi-day-events-row.svelte';

	import { cn } from '$lib/utils';
	import {
		groupEvents,
		getEventBlockStyle,
		isWorkingHour,
		getVisibleHours,
		formatHourLabel
	} from '../../helpers';

	import type { IEvent } from '../../interfaces';

	let { singleDayEvents, multiDayEvents }: { singleDayEvents: IEvent[]; multiDayEvents: IEvent[] } =
		$props();

	const QUARTERS = [0, 15, 30, 45];

	const calendar = getCalendarState();

	const visible = $derived(getVisibleHours(calendar.visibleHours, singleDayEvents));
	const weekStart = $derived(startOfWeek(calendar.selectedDate));
	const weekDays = $derived(Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)));

	// A finished create-drag hands back a time range; mounting the dialog against
	// it seeds a fresh form. Unmounting on close is what resets it — `superForm`
	// seeds its defaults once, at construction.
	let pending = $state<{ start: Date; end: Date } | null>(null);
	const createDrag = new CreateDrag((start, end) => (pending = { start, end }));

	function eventsForDay(day: Date) {
		return singleDayEvents.filter(
			(event) =>
				isSameDay(parseISO(event.startDate), day) || isSameDay(parseISO(event.endDate), day)
		);
	}

	function blockStyle(event: IEvent, day: Date, groupIndex: number, groups: IEvent[][]) {
		const style = getEventBlockStyle(event, day, groupIndex, groups.length, {
			from: visible.earliestEventHour,
			to: visible.latestEventHour
		});

		const hasOverlap = groups.some(
			(otherGroup, otherIndex) =>
				otherIndex !== groupIndex &&
				otherGroup.some((otherEvent) =>
					areIntervalsOverlapping(
						{ start: parseISO(event.startDate), end: parseISO(event.endDate) },
						{ start: parseISO(otherEvent.startDate), end: parseISO(otherEvent.endDate) }
					)
				)
		);

		if (!hasOverlap) return { ...style, width: '100%', left: '0%' };
		return style;
	}
</script>

<div
	class="text-muted-foreground flex flex-col items-center justify-center border-b py-4 text-sm sm:hidden"
>
	<p>Weekly view is not available on smaller devices.</p>
	<p>Please switch to daily or monthly view.</p>
</div>

<div class="hidden flex-col sm:flex">
	<div>
		<WeekViewMultiDayEventsRow selectedDate={calendar.selectedDate} {multiDayEvents} />

		<!-- Week header -->
		<div class="relative z-20 flex border-b">
			<div class="w-18"></div>
			<div class="grid flex-1 grid-cols-7 divide-x border-l">
				{#each weekDays as day (day.toISOString())}
					<span class="text-muted-foreground py-2 text-center text-xs font-medium">
						{format(day, 'EE')}
						<span class="text-foreground ml-1 font-semibold">{format(day, 'd')}</span>
					</span>
				{/each}
			</div>
		</div>
	</div>

	<ScrollArea class="h-[736px]" type="always">
		<div class="flex overflow-hidden">
			<!-- Hours column -->
			<div class="relative w-18">
				{#each visible.hours as hour, index (hour)}
					<div class="relative" style="height: 96px">
						<div class="absolute -top-3 right-2 flex h-6 items-center">
							{#if index !== 0}
								<span class="text-muted-foreground text-xs">
									{formatHourLabel(hour)}
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- Week grid -->
			<div class="relative flex-1 border-l">
				<div class="grid grid-cols-7 divide-x">
					{#each weekDays as day (day.toISOString())}
						{@const groupedEvents = groupEvents(eventsForDay(day))}

						<div class="relative" data-day-column>
							{#each visible.hours as hour, index (hour)}
								{@const isDisabled = !isWorkingHour(day, hour, calendar.workingHours)}

								<div
									class={cn('relative', isDisabled && 'bg-calendar-disabled-hour')}
									style="height: 96px"
								>
									{#if index !== 0}
										<div class="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
									{/if}

									{#each QUARTERS as minute (minute)}
										<DroppableTimeBlock
											date={day}
											{hour}
											{minute}
											{createDrag}
											fromHour={visible.earliestEventHour}
											toHour={visible.latestEventHour}
										/>
									{/each}

									<div
										class="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"
									></div>
								</div>
							{/each}

							<CreateDragPreview
								{createDrag}
								date={day}
								dayKey={format(day, 'yyyy-MM-dd')}
								fromHour={visible.earliestEventHour}
								toHour={visible.latestEventHour}
							/>

							{#each groupedEvents as group, groupIndex (groupIndex)}
								{#each group as event (event.id)}
									{@const style = blockStyle(event, day, groupIndex, groupedEvents)}
									<div
										class="absolute p-1"
										style="top: {style.top}; width: {style.width}; left: {style.left}"
									>
										<EventBlock {event} />
									</div>
								{/each}
							{/each}
						</div>
					{/each}
				</div>

				<CalendarTimeline
					firstVisibleHour={visible.earliestEventHour}
					lastVisibleHour={visible.latestEventHour}
				/>
			</div>
		</div>
	</ScrollArea>
</div>

<!-- Mounted only while a drag is pending, so each gesture gets a freshly seeded
     form. Closing it, by any route, unmounts it. -->
{#if pending}
	{@const selection = pending}
	<AddEventDialog
		bind:open={() => true, (next) => !next && (pending = null)}
		startDate={selection.start}
		startTime={{ hour: selection.start.getHours(), minute: selection.start.getMinutes() }}
		endDate={selection.end}
		endTime={{ hour: selection.end.getHours(), minute: selection.end.getMinutes() }}
	/>
{/if}
