<script lang="ts">
	import {
		parseISO,
		startOfDay,
		startOfWeek,
		endOfWeek,
		addDays,
		differenceInDays,
		isBefore,
		isAfter
	} from 'date-fns';

	import MonthEventBadge from '../month-view/month-event-badge.svelte';

	import type { IEvent } from '../../interfaces';

	type PositionedEvent = IEvent & {
		adjustedStart: Date;
		adjustedEnd: Date;
		startIndex: number;
		endIndex: number;
	};

	let { selectedDate, multiDayEvents }: { selectedDate: Date; multiDayEvents: IEvent[] } = $props();

	const weekStart = $derived(startOfWeek(selectedDate));
	const weekEnd = $derived(endOfWeek(selectedDate));
	const weekDays = $derived(Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)));

	const processedEvents = $derived(
		multiDayEvents
			.map((event): PositionedEvent => {
				const start = parseISO(event.startDate);
				const end = parseISO(event.endDate);
				const adjustedStart = isBefore(start, weekStart) ? weekStart : start;
				const adjustedEnd = isAfter(end, weekEnd) ? weekEnd : end;

				return {
					...event,
					adjustedStart,
					adjustedEnd,
					startIndex: differenceInDays(adjustedStart, weekStart),
					endIndex: differenceInDays(adjustedEnd, weekStart)
				};
			})
			.sort((a, b) => {
				const startDiff = a.adjustedStart.getTime() - b.adjustedStart.getTime();
				if (startDiff !== 0) return startDiff;
				return b.endIndex - b.startIndex - (a.endIndex - a.startIndex);
			})
	);

	const eventRows = $derived.by(() => {
		const rows: PositionedEvent[][] = [];

		processedEvents.forEach((event) => {
			let rowIndex = rows.findIndex((row) =>
				row.every((e) => e.endIndex < event.startIndex || e.startIndex > event.endIndex)
			);

			if (rowIndex === -1) {
				rowIndex = rows.length;
				rows.push([]);
			}

			rows[rowIndex].push(event);
		});

		return rows;
	});

	const hasEventsInWeek = $derived(
		multiDayEvents.some((event) => {
			const start = parseISO(event.startDate);
			const end = parseISO(event.endDate);

			return (
				// Event starts within the week
				(start >= weekStart && start <= weekEnd) ||
				// Event ends within the week
				(end >= weekStart && end <= weekEnd) ||
				// Event spans the entire week
				(start <= weekStart && end >= weekEnd)
			);
		})
	);

	function positionFor(event: PositionedEvent, dayIndex: number) {
		if (dayIndex === event.startIndex && dayIndex === event.endIndex) return 'none' as const;
		if (dayIndex === event.startIndex) return 'first' as const;
		if (dayIndex === event.endIndex) return 'last' as const;
		return 'middle' as const;
	}
</script>

{#if hasEventsInWeek}
	<div class="hidden overflow-hidden sm:flex">
		<div class="w-18 border-b"></div>
		<div class="grid flex-1 grid-cols-7 divide-x border-b border-l">
			{#each weekDays as day, dayIndex (day.toISOString())}
				<div class="flex h-full flex-col gap-1 py-1">
					{#each eventRows as row, rowIndex (rowIndex)}
						{@const event = row.find((e) => e.startIndex <= dayIndex && e.endIndex >= dayIndex)}
						{#if event}
							<MonthEventBadge
								{event}
								cellDate={startOfDay(day)}
								position={positionFor(event, dayIndex)}
							/>
						{:else}
							<div class="h-6.5"></div>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	</div>
{/if}
