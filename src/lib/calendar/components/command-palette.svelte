<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { format, parseISO } from 'date-fns';

	import CalendarRangeIcon from '@lucide/svelte/icons/calendar-range';
	import CalendarCheckIcon from '@lucide/svelte/icons/calendar-check';
	import ColumnsIcon from '@lucide/svelte/icons/columns-2';
	import Grid2x2Icon from '@lucide/svelte/icons/grid-2x2';
	import Grid3x3Icon from '@lucide/svelte/icons/grid-3x3';
	import ListIcon from '@lucide/svelte/icons/list';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import { getCalendarState } from '../contexts/calendar-context.svelte';

	import * as Command from '$lib/components/ui/command';
	import AddEventDialog from './dialogs/add-event-dialog.svelte';

	import type { IEvent } from '../interfaces';

	const calendar = getCalendarState();

	let open = $state(false);
	let creating = $state(false);
	let search = $state('');

	/** Past this many matches the list stops being scannable. See `hiddenMatches`. */
	const MAX_EVENT_RESULTS = 8;

	const VIEWS = [
		{ label: 'Day view', href: '/day-view', icon: ListIcon },
		{ label: 'Week view', href: '/week-view', icon: ColumnsIcon },
		{ label: 'Month view', href: '/month-view', icon: Grid2x2Icon },
		{ label: 'Year view', href: '/year-view', icon: Grid3x3Icon },
		{ label: 'Agenda view', href: '/agenda-view', icon: CalendarRangeIcon }
	] as const;

	const query = $derived(search.trim().toLowerCase());
	const matches = (text: string) => text.toLowerCase().includes(query);

	const views = $derived(VIEWS.filter((view) => matches(view.label)));
	const showToday = $derived(matches('Go to today'));
	const showCreate = $derived(matches('Create event'));

	// A plain `filter` over the events already in memory. There are tens of them,
	// not thousands; an index would be machinery in search of a problem.
	//
	// Events only appear once something is typed. Listing every event under an
	// empty query would bury the commands the palette exists to offer.
	const eventMatches = $derived(
		query.length === 0
			? []
			: calendar.events
					.filter((event) => matches(event.title))
					.toSorted((a, b) => a.startDate.localeCompare(b.startDate))
	);

	const shownEvents = $derived(eventMatches.slice(0, MAX_EVENT_RESULTS));
	const hiddenMatches = $derived(eventMatches.length - shownEvents.length);

	const isEmpty = $derived(
		views.length === 0 && !showToday && !showCreate && eventMatches.length === 0
	);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key.toLowerCase() !== 'k' || (!event.metaKey && !event.ctrlKey)) return;

		event.preventDefault();

		// Closing works from anywhere, including from inside the palette's own input.
		if (open) {
			open = false;
			return;
		}

		// Never stack the palette on top of the event form or the details dialog.
		if (document.querySelector('[data-slot="dialog-content"]')) return;

		search = '';
		open = true;
	}

	function run(action: () => void) {
		open = false;
		action();
	}

	function goToEvent(event: IEvent) {
		calendar.selectDate(parseISO(event.startDate));
		goto(resolve('/day-view'));
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Command.Dialog bind:open shouldFilter={false} label="Command palette">
	<Command.Input placeholder="Search events, or jump to a view…" bind:value={search} />

	<Command.List>
		{#if isEmpty}
			<div class="text-muted-foreground py-6 text-center text-sm">
				No matches for “{search.trim()}”.
			</div>
		{/if}

		{#if views.length > 0}
			<Command.Group heading="Views">
				{#each views as view (view.href)}
					{@const Icon = view.icon}
					<Command.Item value={view.href} onSelect={() => run(() => goto(resolve(view.href)))}>
						<Icon />
						{view.label}
					</Command.Item>
				{/each}
			</Command.Group>
		{/if}

		{#if showToday || showCreate}
			<Command.Group heading="Actions">
				{#if showToday}
					<Command.Item value="today" onSelect={() => run(() => calendar.selectDate(new Date()))}>
						<CalendarCheckIcon />
						Go to today
					</Command.Item>
				{/if}

				{#if showCreate}
					<Command.Item value="create" onSelect={() => run(() => (creating = true))}>
						<PlusIcon />
						Create event
					</Command.Item>
				{/if}
			</Command.Group>
		{/if}

		{#if shownEvents.length > 0}
			<Command.Group heading="Events">
				{#each shownEvents as event (event.id)}
					<Command.Item value="event-{event.id}" onSelect={() => run(() => goToEvent(event))}>
						<span class="truncate">{event.title}</span>
						<span class="text-muted-foreground ml-auto shrink-0 text-xs">
							{format(parseISO(event.startDate), 'MMM d, h:mm a')}
						</span>
					</Command.Item>
				{/each}

				{#if hiddenMatches > 0}
					<!-- Never truncate silently: a cut list looks like the whole list. -->
					<p class="text-muted-foreground px-2 py-1.5 text-xs">
						Showing {shownEvents.length} of {eventMatches.length} matches. Keep typing to narrow them.
					</p>
				{/if}
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>

<!-- Mounted on demand so the form is seeded fresh, and unmounted when closed. -->
{#if creating}
	<AddEventDialog bind:open={() => true, (next) => !next && (creating = false)} />
{/if}
