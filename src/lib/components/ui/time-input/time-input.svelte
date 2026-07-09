<script lang="ts">
	import { TimeField } from 'bits-ui';
	import { Time } from '@internationalized/date';

	import { cn } from '$lib/utils';

	// Replaces react-aria's TimeField. The calendar speaks `{ hour, minute }`,
	// bits-ui speaks @internationalized/date `Time`, so this translates both ways.
	type TTimeValue = { hour: number; minute: number };

	// `restProps` carries formsnap's control props (id, name, aria-*) onto the
	// input, which is why `id` is not declared explicitly here.
	let {
		value,
		onChange,
		hourCycle = 12,
		granularity = 'minute',
		disabled = false,
		invalid = false,
		class: className,
		segmentClass,
		...restProps
	}: {
		value?: TTimeValue;
		onChange?: (value: TTimeValue | undefined) => void;
		hourCycle?: 12 | 24;
		granularity?: 'hour' | 'minute' | 'second';
		disabled?: boolean;
		invalid?: boolean;
		class?: string;
		segmentClass?: string;
		[key: string]: unknown;
	} = $props();

	const timeValue = $derived(
		value && Number.isFinite(value.hour) ? new Time(value.hour, value.minute) : undefined
	);

	function handleChange(next: Time | undefined) {
		onChange?.(next ? { hour: next.hour, minute: next.minute } : undefined);
	}
</script>

<TimeField.Root value={timeValue} onValueChange={handleChange} {hourCycle} {granularity} {disabled}>
	<TimeField.Input
		aria-label="Time"
		{...restProps}
		data-invalid={invalid ? '' : undefined}
		class={cn(
			'bg-background peer inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border px-3 py-2 text-sm',
			'focus-within:ring-ring focus-within:outline-none focus-within:ring-1',
			'data-[invalid]:border-destructive',
			'data-disabled:cursor-not-allowed data-disabled:opacity-50',
			className
		)}
	>
		{#snippet children({ segments })}
			<!-- Keyed by index, not by `part`: a time has several `literal`
			     segments (the ":" and the space before AM/PM). -->
			{#each segments as segment, index (index)}
				<TimeField.Segment
					part={segment.part}
					class={cn(
						'inline rounded p-0.5 caret-transparent outline outline-0',
						'focus:bg-foreground/10 focus:text-foreground focus:outline-none',
						'data-disabled:cursor-not-allowed data-disabled:opacity-50',
						segment.part === 'literal' && 'text-muted-foreground',
						segmentClass
					)}
				>
					{segment.value}
				</TimeField.Segment>
			{/each}
		{/snippet}
	</TimeField.Input>
</TimeField.Root>
