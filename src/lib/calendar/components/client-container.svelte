<script lang="ts">
	import { isSameDay, parseISO } from 'date-fns';
	import { onMount } from 'svelte';

	import { getCalendarState } from '../contexts/calendar-context.svelte';

	import CalendarHeader from './header/calendar-header.svelte';
	import CalendarSkeleton from './calendar-skeleton.svelte';

	import CalendarYearView from './year-view/calendar-year-view.svelte';
	import CalendarMonthView from './month-view/calendar-month-view.svelte';
	import CalendarAgendaView from './agenda-view/calendar-agenda-view.svelte';
	import CalendarDayView from './week-and-day-view/calendar-day-view.svelte';
	import CalendarWeekView from './week-and-day-view/calendar-week-view.svelte';

	import type { TCalendarView } from '../types';

	let { view }: { view: TCalendarView } = $props();

	const calendar = getCalendarState();

	// `@shimmer-from-structure/svelte` is a client-only library, in two ways that
	// both 500 a server-rendered page:
	//   1. Its bundle imports `svelte/internal/client` and calls `user_effect` in
	//      the component body — `effect_orphan` under the SSR renderer.
	//   2. Its `core` dependency ships an ESM `dist/index.esm.js` with no
	//      `"type": "module"`, so the Vercel Node runtime loads it as CommonJS and
	//      throws `Unexpected token 'export'`.
	// A static `import` pulls both into the SSR module graph and fails at request
	// time on Vercel, even when the component is never rendered on the server — the
	// module is still evaluated at import. So load it dynamically, after mount:
	// `onMount` never runs on the server, so nothing shimmer-related enters the
	// server graph. Until it resolves, `CalendarSkeleton` stands in. Because the
	// component is null on both the server and the first client render, hydration
	// matches exactly.
	let Shimmer = $state<typeof import('@shimmer-from-structure/svelte').Shimmer | null>(null);

	onMount(async () => {
		({ Shimmer } = await import('@shimmer-from-structure/svelte'));
	});

	// Every Date below is a throwaway bound used inside the filter predicate.
	/* eslint-disable svelte/prefer-svelte-reactivity */
	const filteredEvents = $derived(
		calendar.events.filter((event) => {
			const eventStartDate = parseISO(event.startDate);
			const eventEndDate = parseISO(event.endDate);
			const selectedDate = calendar.selectedDate;
			const isUserMatch =
				calendar.selectedUserId === 'all' || event.user.id === calendar.selectedUserId;

			if (view === 'year') {
				const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
				const yearEnd = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);
				return eventStartDate <= yearEnd && eventEndDate >= yearStart && isUserMatch;
			}

			if (view === 'month' || view === 'agenda') {
				const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
				const monthEnd = new Date(
					selectedDate.getFullYear(),
					selectedDate.getMonth() + 1,
					0,
					23,
					59,
					59,
					999
				);
				return eventStartDate <= monthEnd && eventEndDate >= monthStart && isUserMatch;
			}

			if (view === 'week') {
				const dayOfWeek = selectedDate.getDay();

				const weekStart = new Date(selectedDate);
				weekStart.setDate(selectedDate.getDate() - dayOfWeek);
				weekStart.setHours(0, 0, 0, 0);

				const weekEnd = new Date(weekStart);
				weekEnd.setDate(weekStart.getDate() + 6);
				weekEnd.setHours(23, 59, 59, 999);

				return eventStartDate <= weekEnd && eventEndDate >= weekStart && isUserMatch;
			}

			if (view === 'day') {
				const dayStart = new Date(
					selectedDate.getFullYear(),
					selectedDate.getMonth(),
					selectedDate.getDate(),
					0,
					0,
					0
				);
				const dayEnd = new Date(
					selectedDate.getFullYear(),
					selectedDate.getMonth(),
					selectedDate.getDate(),
					23,
					59,
					59
				);
				return eventStartDate <= dayEnd && eventEndDate >= dayStart && isUserMatch;
			}

			return false;
		})
	);
	/* eslint-enable svelte/prefer-svelte-reactivity */

	const singleDayEvents = $derived(
		filteredEvents.filter((event) => isSameDay(parseISO(event.startDate), parseISO(event.endDate)))
	);

	const multiDayEvents = $derived(
		filteredEvents.filter((event) => !isSameDay(parseISO(event.startDate), parseISO(event.endDate)))
	);

	// For year view, we only care about the start date. Using the same date for
	// both start and end ensures only the start day will show a dot.
	const eventStartDates = $derived(
		filteredEvents.map((event) => ({ ...event, endDate: event.startDate }))
	);
</script>

{#snippet grid()}
	{#if view === 'day'}
		<CalendarDayView {singleDayEvents} {multiDayEvents} />
	{:else if view === 'month'}
		<CalendarMonthView {singleDayEvents} {multiDayEvents} />
	{:else if view === 'week'}
		<CalendarWeekView {singleDayEvents} {multiDayEvents} />
	{:else if view === 'year'}
		<CalendarYearView allEvents={eventStartDates} />
	{:else if view === 'agenda'}
		<CalendarAgendaView {singleDayEvents} {multiDayEvents} />
	{/if}
{/snippet}

<div class="overflow-hidden rounded-xl border">
	<CalendarHeader {view} events={filteredEvents} />

	<!-- Shimmer arrives from a dynamic import after mount (see the script). Until
	     then — on the server and the first client frame — the skeleton stands in. -->
	{#if Shimmer}
		<Shimmer loading={!calendar.hydrated}>
			{@render grid()}
		</Shimmer>
	{:else}
		<CalendarSkeleton {view} />
	{/if}
</div>
