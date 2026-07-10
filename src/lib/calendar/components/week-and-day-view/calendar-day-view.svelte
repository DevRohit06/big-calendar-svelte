<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import UserIcon from '@lucide/svelte/icons/user';
	import { parseISO, areIntervalsOverlapping, format } from 'date-fns';
	import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Calendar, Day as CalendarDay } from '$lib/components/ui/calendar';

	import CalendarX2Icon from '@lucide/svelte/icons/calendar-x-2';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import { Button } from '$lib/components/ui/button';

	import EventDots from '../event-dots.svelte';
	import EmptyState from '../empty-state.svelte';
	import AddEventDialog from '../dialogs/add-event-dialog.svelte';
	import EventBlock from './event-block.svelte';
	import DroppableTimeBlock from '../dnd/droppable-time-block.svelte';
	import CreateDragPreview from '../dnd/create-drag-preview.svelte';
	import { CreateDrag } from '../dnd/create-drag.svelte';
	import CalendarTimeline from './calendar-time-line.svelte';
	import DayViewMultiDayEventsRow from './day-view-multi-day-events-row.svelte';

	import { cn } from '$lib/utils';
	import {
		groupEvents,
		getEventBlockStyle,
		isWorkingHour,
		getCurrentEvents,
		getVisibleHours,
		formatHourLabel
	} from '../../helpers';

	import type { IEvent } from '../../interfaces';

	let { singleDayEvents, multiDayEvents }: { singleDayEvents: IEvent[]; multiDayEvents: IEvent[] } =
		$props();

	const QUARTERS = [0, 15, 30, 45];

	const calendar = getCalendarState();

	const visible = $derived(getVisibleHours(calendar.visibleHours, singleDayEvents));
	const currentEvents = $derived(getCurrentEvents(singleDayEvents));

	// Both props arrive already narrowed to the selected day by `client-container`.
	const isDayEmpty = $derived(singleDayEvents.length === 0 && multiDayEvents.length === 0);

	// A finished create-drag hands back a time range; mounting the dialog against
	// it seeds a fresh form. Unmounting on close is what resets it — `superForm`
	// seeds its defaults once, at construction.
	let pending = $state<{ start: Date; end: Date } | null>(null);
	const createDrag = new CreateDrag((start, end) => (pending = { start, end }));

	// Dots on the mini calendar mark the day an event *starts*, matching the year
	// view. A multi-day event therefore dots only its first day, rather than
	// smearing across the month.
	//
	// Read from the store, not from `singleDayEvents`/`multiDayEvents`: for the
	// day view those props are already narrowed to the selected day, so they
	// could only ever dot the day you are looking at. The user filter still
	// applies, matching what the grid beside it shows.
	const eventsByStartDay = $derived.by(() => {
		const byDay: Record<string, IEvent[]> = {};

		for (const event of calendar.events) {
			if (calendar.selectedUserId !== 'all' && event.user.id !== calendar.selectedUserId) continue;

			const key = format(parseISO(event.startDate), 'yyyy-MM-dd');
			(byDay[key] ??= []).push(event);
		}

		return byDay;
	});

	const dayEvents = $derived(
		singleDayEvents.filter((event) => {
			const eventDate = parseISO(event.startDate);
			return (
				eventDate.getDate() === calendar.selectedDate.getDate() &&
				eventDate.getMonth() === calendar.selectedDate.getMonth() &&
				eventDate.getFullYear() === calendar.selectedDate.getFullYear()
			);
		})
	);

	const groupedEvents = $derived(groupEvents(dayEvents));

	// bits-ui speaks @internationalized/date, react-day-picker spoke native Date.
	const selectedDateValue = $derived(
		new CalendarDate(
			calendar.selectedDate.getFullYear(),
			calendar.selectedDate.getMonth() + 1,
			calendar.selectedDate.getDate()
		)
	);

	function onSelectDate(value: DateValue | undefined) {
		if (value) calendar.selectDate(value.toDate(getLocalTimeZone()));
	}

	function blockStyle(event: IEvent, groupIndex: number) {
		const style = getEventBlockStyle(
			event,
			calendar.selectedDate,
			groupIndex,
			groupedEvents.length,
			{
				from: visible.earliestEventHour,
				to: visible.latestEventHour
			}
		);

		const hasOverlap = groupedEvents.some(
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

<div class="flex">
	<div class="flex flex-1 flex-col">
		<div>
			<DayViewMultiDayEventsRow selectedDate={calendar.selectedDate} {multiDayEvents} />

			<!-- Day header -->
			<div class="relative z-20 flex border-b">
				<div class="w-18"></div>
				<span class="text-muted-foreground flex-1 border-l py-2 text-center text-xs font-medium">
					{format(calendar.selectedDate, 'EE')}
					<span class="text-foreground font-semibold">{format(calendar.selectedDate, 'd')}</span>
				</span>
			</div>
		</div>

		<ScrollArea class="h-[800px]" type="always">
			<div class="flex">
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

				<!-- Day grid -->
				<div class="relative flex-1 border-l">
					<div class="relative" data-day-column>
						{#each visible.hours as hour, index (hour)}
							{@const isDisabled = !isWorkingHour(
								calendar.selectedDate,
								hour,
								calendar.workingHours
							)}

							<div
								class={cn('relative', isDisabled && 'bg-calendar-disabled-hour')}
								style="height: 96px"
							>
								{#if index !== 0}
									<div class="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
								{/if}

								{#each QUARTERS as minute (minute)}
									<DroppableTimeBlock
										date={calendar.selectedDate}
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
							date={calendar.selectedDate}
							dayKey={format(calendar.selectedDate, 'yyyy-MM-dd')}
							fromHour={visible.earliestEventHour}
							toHour={visible.latestEventHour}
						/>

						{#each groupedEvents as group, groupIndex (groupIndex)}
							{#each group as event (event.id)}
								{@const style = blockStyle(event, groupIndex)}
								<div
									class="absolute p-1"
									style="top: {style.top}; width: {style.width}; left: {style.left}"
								>
									<EventBlock {event} />
								</div>
							{/each}
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

	<div class="hidden w-64 divide-y border-l md:block">
		<!-- Cells stay at the default 32px: seven 40px columns plus padding overflow
		     this 256px sidebar and clip Saturday. The dot row fits inside 32px. -->
		<Calendar
			class="mx-auto w-fit"
			type="single"
			value={selectedDateValue}
			onValueChange={onSelectDate}
		>
			{#snippet day({ day: date, outsideMonth })}
				<CalendarDay>
					{date.day}

					<!-- The dot row is always reserved, even when empty. `CalendarDay` centres
					     its children, so a cell that only sometimes has dots would sit its
					     number 5px higher than its neighbours and the week would jitter. -->
					<div class="flex h-2 items-center justify-center">
						{#if !outsideMonth}
							<EventDots events={eventsByStartDay[date.toString()] ?? []} />
						{/if}
					</div>
				</CalendarDay>
			{/snippet}
		</Calendar>

		<div class="flex-1 space-y-3">
			<!-- Three states, not two: a day with nothing on it is a different thing
			     from a day whose events are simply not happening right now, and only
			     the first is worth offering a Create button for. -->
			{#if isDayEmpty}
				<EmptyState
					icon={CalendarX2Icon}
					title="Nothing scheduled today"
					description="Drag across the grid to block out a time, or create an event."
					class="p-6"
				>
					<AddEventDialog startDate={calendar.selectedDate}>
						{#snippet children(triggerProps)}
							<Button {...triggerProps} size="sm">
								<PlusIcon />
								Create event
							</Button>
						{/snippet}
					</AddEventDialog>
				</EmptyState>
			{:else if currentEvents.length > 0}
				<div class="flex items-start gap-2 px-4 pt-4">
					<span class="relative mt-[5px] flex size-2.5">
						<span
							class="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"
						></span>
						<span class="relative inline-flex size-2.5 rounded-full bg-green-600"></span>
					</span>

					<p class="text-foreground text-sm font-semibold">Happening now</p>
				</div>
			{:else}
				<p class="text-muted-foreground p-4 text-center text-sm italic">
					No appointments or consultations at the moment
				</p>
			{/if}

			{#if currentEvents.length > 0}
				<ScrollArea class="h-[422px] px-4" type="always">
					<div class="space-y-6 pb-4">
						{#each currentEvents as event (event.id)}
							{@const user = calendar.users.find((u) => u.id === event.user.id)}
							<div class="space-y-1.5">
								<p class="line-clamp-2 text-sm font-semibold">{event.title}</p>

								{#if user}
									<div class="text-muted-foreground flex items-center gap-1.5">
										<UserIcon class="size-3.5" />
										<span class="text-sm">{user.name}</span>
									</div>
								{/if}

								<div class="text-muted-foreground flex items-center gap-1.5">
									<CalendarIcon class="size-3.5" />
									<span class="text-sm">{format(new Date(), 'MMM d, yyyy')}</span>
								</div>

								<div class="text-muted-foreground flex items-center gap-1.5">
									<ClockIcon class="size-3.5" />
									<span class="text-sm">
										{format(parseISO(event.startDate), 'h:mm a')} - {format(
											parseISO(event.endDate),
											'h:mm a'
										)}
									</span>
								</div>
							</div>
						{/each}
					</div>
				</ScrollArea>
			{/if}
		</div>
	</div>
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
