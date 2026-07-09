<script lang="ts">
	import { getCalendarState } from '../contexts/calendar-context.svelte';

	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';

	const calendar = getCalendarState();

	const LABELS = { dot: 'Dot', colored: 'Colored', mixed: 'Mixed' } as const;
</script>

<div class="space-y-2">
	<Label for="badge-variant">Event badge style</Label>

	<Select.Root type="single" bind:value={calendar.badgeVariant}>
		<Select.Trigger id="badge-variant" class="w-48">
			{LABELS[calendar.badgeVariant]}
		</Select.Trigger>

		<Select.Content>
			{#each Object.entries(LABELS) as [value, label] (value)}
				<Select.Item {value} {label}>{label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
