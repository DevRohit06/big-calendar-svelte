<script lang="ts">
	import { formatDate } from 'date-fns';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	import { getEventsCount, navigateDate, rangeText } from '../../helpers';

	import type { IEvent } from '../../interfaces';
	import type { TCalendarView } from '../../types';

	let { view, events }: { view: TCalendarView; events: IEvent[] } = $props();

	const calendar = getCalendarState();

	const month = $derived(formatDate(calendar.selectedDate, 'MMMM'));
	const year = $derived(calendar.selectedDate.getFullYear());
	const eventCount = $derived(getEventsCount(events, calendar.selectedDate, view));

	const handlePrevious = () =>
		calendar.selectDate(navigateDate(calendar.selectedDate, view, 'previous'));
	const handleNext = () => calendar.selectDate(navigateDate(calendar.selectedDate, view, 'next'));
</script>

<div class="space-y-0.5">
	<div class="flex items-center gap-2">
		<span class="text-lg font-semibold">{month} {year}</span>
		<Badge variant="outline" class="px-1.5">{eventCount} events</Badge>
	</div>

	<div class="flex items-center gap-2">
		<Button
			variant="outline"
			aria-label="Previous {view}"
			class="size-6.5 px-0 [&_svg]:size-4.5"
			onclick={handlePrevious}
		>
			<ChevronLeftIcon />
		</Button>

		<p class="text-muted-foreground text-sm">{rangeText(view, calendar.selectedDate)}</p>

		<Button
			variant="outline"
			aria-label="Next {view}"
			class="size-6.5 px-0 [&_svg]:size-4.5"
			onclick={handleNext}
		>
			<ChevronRightIcon />
		</Button>
	</div>
</div>
