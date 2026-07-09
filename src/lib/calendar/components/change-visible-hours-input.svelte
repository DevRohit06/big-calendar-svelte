<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';

	import { getCalendarState } from '../contexts/calendar-context.svelte';

	import { Button } from '$lib/components/ui/button';
	import { TimeInput } from '$lib/components/ui/time-input';
	import * as Tooltip from '$lib/components/ui/tooltip';

	const calendar = getCalendarState();

	let from = $state({ hour: calendar.visibleHours.from, minute: 0 });
	let to = $state({ hour: calendar.visibleHours.to, minute: 0 });

	function handleApply() {
		// Midnight as an end hour means "end of day", not hour zero.
		const toHour = to.hour === 0 ? 24 : to.hour;
		calendar.visibleHours = { from: from.hour, to: toHour };
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center gap-2">
		<p class="text-sm font-semibold">Change visible hours</p>

		<Tooltip.Provider delayDuration={100}>
			<Tooltip.Root>
				<Tooltip.Trigger>
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

	<div class="flex items-center gap-4">
		<p>From</p>
		<TimeInput
			id="start-time"
			hourCycle={12}
			granularity="hour"
			value={from}
			onChange={(value) => value && (from = value)}
		/>
		<p>To</p>
		<TimeInput
			id="end-time"
			hourCycle={12}
			granularity="hour"
			value={to}
			onChange={(value) => value && (to = value)}
		/>
	</div>

	<Button class="mt-4 w-fit" onclick={handleApply}>Apply</Button>
</div>
