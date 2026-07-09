<script lang="ts">
	import { getCalendarState } from '../contexts/calendar-context.svelte';

	import * as Select from '$lib/components/ui/select';

	const calendar = getCalendarState();

	const LABELS = { dot: 'Dot', colored: 'Colored', mixed: 'Mixed' } as const;
</script>

<div class="space-y-2">
	<p class="text-sm font-semibold">Change badge variant</p>

	<Select.Root type="single" bind:value={calendar.badgeVariant}>
		<Select.Trigger class="w-48">{LABELS[calendar.badgeVariant]}</Select.Trigger>

		<Select.Content>
			<Select.Item value="dot" label="Dot">Dot</Select.Item>
			<Select.Item value="colored" label="Colored">Colored</Select.Item>
			<Select.Item value="mixed" label="Mixed">Mixed</Select.Item>
		</Select.Content>
	</Select.Root>
</div>
