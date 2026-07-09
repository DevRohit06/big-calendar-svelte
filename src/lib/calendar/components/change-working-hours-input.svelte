<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';
	import MoonIcon from '@lucide/svelte/icons/moon';

	import { getCalendarState } from '../contexts/calendar-context.svelte';

	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { TimeInput } from '$lib/components/ui/time-input';
	import * as Tooltip from '$lib/components/ui/tooltip';

	import type { TWorkingHours } from '../types';

	const DAYS_OF_WEEK = [
		{ index: 0, name: 'Sunday' },
		{ index: 1, name: 'Monday' },
		{ index: 2, name: 'Tuesday' },
		{ index: 3, name: 'Wednesday' },
		{ index: 4, name: 'Thursday' },
		{ index: 5, name: 'Friday' },
		{ index: 6, name: 'Saturday' }
	];

	const calendar = getCalendarState();

	let localWorkingHours = $state<TWorkingHours>({ ...calendar.workingHours });

	const isDayActive = (dayId: number) =>
		localWorkingHours[dayId].from > 0 || localWorkingHours[dayId].to > 0;

	function handleToggleDay(dayId: number) {
		localWorkingHours[dayId] = isDayActive(dayId) ? { from: 0, to: 0 } : { from: 9, to: 17 };
	}

	function handleTimeChange(
		dayId: number,
		timeType: 'from' | 'to',
		value: { hour: number; minute: number } | undefined
	) {
		if (!value) return;

		const updatedDay = { ...localWorkingHours[dayId], [timeType]: value.hour };
		if (timeType === 'to' && value.hour === 0 && updatedDay.from === 0) updatedDay.to = 24;
		localWorkingHours[dayId] = updatedDay;
	}

	function handleSave() {
		const updated: TWorkingHours = {};

		for (const key of Object.keys(localWorkingHours)) {
			const dayId = Number(key);
			const day = localWorkingHours[dayId];

			if (isDayActive(dayId)) {
				if (day.from === 0 && day.to === 0) updated[dayId] = { from: 0, to: 24 };
				else if (day.to === 0 && day.from > 0) updated[dayId] = { ...day, to: 24 };
				else updated[dayId] = { ...day };
			} else {
				updated[dayId] = { from: 0, to: 0 };
			}
		}

		calendar.workingHours = updated;
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center gap-2">
		<p class="text-sm font-semibold">Change working hours</p>

		<Tooltip.Provider delayDuration={100}>
			<Tooltip.Root>
				<Tooltip.Trigger>
					<InfoIcon class="size-3" />
				</Tooltip.Trigger>

				<Tooltip.Content class="max-w-80 text-center">
					<p>
						This will apply a dashed background to the hour cells that fall outside the working
						hours — only for week and day views.
					</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	</div>

	<div class="space-y-4">
		{#each DAYS_OF_WEEK as day (day.index)}
			<div class="flex items-center gap-4">
				<div class="flex w-40 items-center gap-2">
					<Switch
						checked={isDayActive(day.index)}
						onCheckedChange={() => handleToggleDay(day.index)}
					/>
					<span class="text-sm font-medium">{day.name}</span>
				</div>

				{#if isDayActive(day.index)}
					<div class="flex items-center gap-4">
						<div class="flex items-center gap-2">
							<span>From</span>
							<TimeInput
								id="{day.name.toLowerCase()}-from"
								hourCycle={12}
								granularity="hour"
								value={{ hour: localWorkingHours[day.index].from, minute: 0 }}
								onChange={(value) => handleTimeChange(day.index, 'from', value)}
							/>
						</div>

						<div class="flex items-center gap-2">
							<span>To</span>
							<TimeInput
								id="{day.name.toLowerCase()}-to"
								hourCycle={12}
								granularity="hour"
								value={{ hour: localWorkingHours[day.index].to, minute: 0 }}
								onChange={(value) => handleTimeChange(day.index, 'to', value)}
							/>
						</div>
					</div>
				{:else}
					<div class="text-muted-foreground flex items-center gap-2">
						<MoonIcon class="size-4" />
						<span>Closed</span>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<Button class="mt-4 w-fit" onclick={handleSave}>Apply</Button>
</div>
