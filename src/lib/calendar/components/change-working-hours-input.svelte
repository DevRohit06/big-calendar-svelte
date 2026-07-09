<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';
	import MoonIcon from '@lucide/svelte/icons/moon';

	import { getCalendarState } from '../contexts/calendar-context.svelte';
	import { normalizeHourRange } from '../helpers';

	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { TimeInput } from '$lib/components/ui/time-input';
	import * as Tooltip from '$lib/components/ui/tooltip';

	// Indexed by `Date.getDay()`, and listed Sunday-first to match the week grid.
	const DAYS_OF_WEEK = [
		{ index: 0, name: 'Sunday' },
		{ index: 1, name: 'Monday' },
		{ index: 2, name: 'Tuesday' },
		{ index: 3, name: 'Wednesday' },
		{ index: 4, name: 'Thursday' },
		{ index: 5, name: 'Friday' },
		{ index: 6, name: 'Saturday' }
	];

	const CLOSED = { from: 0, to: 0 };
	const DEFAULT_HOURS = { from: 9, to: 17 };

	const calendar = getCalendarState();

	// Closing a day zeroes its hours, so remember them and restore on reopen
	// rather than snapping every reopened day back to 9–5.
	let lastOpenHours = $state<Record<number, { from: number; to: number }>>({});

	const isOpen = (dayId: number) => {
		const day = calendar.workingHours[dayId];
		return day.from > 0 || day.to > 0;
	};

	function setDay(dayId: number, value: { from: number; to: number }) {
		calendar.workingHours = { ...calendar.workingHours, [dayId]: value };
	}

	function toggleDay(dayId: number) {
		if (isOpen(dayId)) {
			lastOpenHours[dayId] = calendar.workingHours[dayId];
			setDay(dayId, CLOSED);
		} else {
			setDay(dayId, lastOpenHours[dayId] ?? DEFAULT_HOURS);
		}
	}

	function changeTime(dayId: number, edited: 'from' | 'to') {
		return (value: { hour: number; minute: number } | undefined) => {
			if (!value) return;
			setDay(
				dayId,
				normalizeHourRange({ ...calendar.workingHours[dayId], [edited]: value.hour }, edited)
			);
		};
	}
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center gap-2">
		<Label>Working hours</Label>

		<Tooltip.Provider delayDuration={100}>
			<Tooltip.Root>
				<Tooltip.Trigger aria-label="About working hours">
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

	<div class="grid gap-2">
		{#each DAYS_OF_WEEK as day (day.index)}
			{@const open = isOpen(day.index)}
			{@const hours = calendar.workingHours[day.index]}

			<div class="grid grid-cols-[auto_6rem_1fr] items-center gap-3">
				<Switch checked={open} aria-label={day.name} onCheckedChange={() => toggleDay(day.index)} />

				<span class="text-sm font-medium">{day.name}</span>

				{#if open}
					<div class="flex items-center gap-2">
						<TimeInput
							id="{day.name.toLowerCase()}-from"
							aria-label="{day.name} start"
							hourCycle={12}
							granularity="hour"
							value={{ hour: hours.from, minute: 0 }}
							onChange={changeTime(day.index, 'from')}
						/>

						<span class="text-muted-foreground" aria-hidden="true">&rarr;</span>

						<TimeInput
							id="{day.name.toLowerCase()}-to"
							aria-label="{day.name} end"
							hourCycle={12}
							granularity="hour"
							value={{ hour: hours.to % 24, minute: 0 }}
							onChange={changeTime(day.index, 'to')}
						/>
					</div>
				{:else}
					<div class="text-muted-foreground flex items-center gap-1.5 text-sm">
						<MoonIcon class="size-3.5" />
						<span>Closed</span>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
