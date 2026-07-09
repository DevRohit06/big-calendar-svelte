<script lang="ts">
	import { format } from 'date-fns';
	import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date';

	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';

	import { cn } from '$lib/utils';

	// `restProps` carries formsnap's control props (id, name, aria-*) onto the
	// trigger button, which is why `id` is not declared explicitly here.
	let {
		value,
		onSelect,
		placeholder,
		labelVariant = 'PPP',
		invalid = false,
		class: className,
		...restProps
	}: {
		value?: Date;
		onSelect: (value: Date | undefined) => void;
		placeholder: string;
		labelVariant?: 'P' | 'PP' | 'PPP';
		invalid?: boolean;
		class?: string;
		[key: string]: unknown;
	} = $props();

	let open = $state(false);

	// superforms seeds a missing `z.date()` with an invalid Date; formatting that
	// would render "Invalid Date", so treat it as empty.
	const isValid = $derived(value instanceof Date && !Number.isNaN(value.getTime()));

	const dateValue = $derived(
		isValid && value
			? new CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate())
			: undefined
	);

	function handleSelect(next: DateValue | undefined) {
		onSelect(next ? next.toDate(getLocalTimeZone()) : undefined);
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				{...restProps}
				variant="outline"
				aria-invalid={invalid || undefined}
				class={cn(
					'group relative h-9 w-full justify-start whitespace-nowrap px-3 py-2 font-normal hover:bg-inherit',
					className
				)}
			>
				{#if isValid && value}
					<span>{format(value, labelVariant)}</span>
				{:else}
					<span class="text-muted-foreground">{placeholder}</span>
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>

	<Popover.Content align="center" class="w-fit p-0">
		<Calendar type="single" value={dateValue} onValueChange={handleSelect} />
	</Popover.Content>
</Popover.Root>
