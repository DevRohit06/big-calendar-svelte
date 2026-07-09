<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';

	import { getCalendarState } from '../contexts/calendar-context.svelte';
	import { normalizeHourRange } from '../helpers';

	import { Label } from '$lib/components/ui/label';
	import { TimeInput } from '$lib/components/ui/time-input';
	import * as Tooltip from '$lib/components/ui/tooltip';

	const calendar = getCalendarState();

	// Read straight from the store rather than a local copy, so the fields can
	// never drift out of sync with the calendar. `to` is stored as 24 for "end
	// of day", which `Time` rejects, so it displays as hour 0 — "12 AM".
	const from = $derived({ hour: calendar.visibleHours.from, minute: 0 });
	const to = $derived({ hour: calendar.visibleHours.to % 24, minute: 0 });

	function change(edited: 'from' | 'to') {
		return (value: { hour: number; minute: number } | undefined) => {
			if (!value) return;
			calendar.visibleHours = normalizeHourRange(
				{ ...calendar.visibleHours, [edited]: value.hour },
				edited
			);
		};
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center gap-2">
		<Label for="visible-hours-from">Visible hours</Label>

		<Tooltip.Provider delayDuration={100}>
			<Tooltip.Root>
				<Tooltip.Trigger aria-label="About visible hours">
					<InfoIcon class="size-3" />
				</Tooltip.Trigger>

				<Tooltip.Content class="max-w-80 text-center">
					<p>
						If an event falls outside the specified visible hours, the visible hours will
						automatically adjust to include that event.
					</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	</div>

	<div class="flex items-center gap-3">
		<TimeInput
			id="visible-hours-from"
			hourCycle={12}
			granularity="hour"
			value={from}
			onChange={change('from')}
		/>

		<span class="text-muted-foreground" aria-hidden="true">&rarr;</span>

		<TimeInput
			id="visible-hours-to"
			aria-label="Visible hours end"
			hourCycle={12}
			granularity="hour"
			value={to}
			onChange={change('to')}
		/>
	</div>
</div>
