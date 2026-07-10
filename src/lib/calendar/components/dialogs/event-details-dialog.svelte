<script lang="ts">
	import { format, parseISO } from 'date-fns';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import TextIcon from '@lucide/svelte/icons/text-align-start';
	import UserIcon from '@lucide/svelte/icons/user';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { getCalendarState } from '../../contexts/calendar-context.svelte';
	import { toastMutation } from '../../notifications';
	import EditEventDialog from './edit-event-dialog.svelte';

	import type { Snippet } from 'svelte';
	import type { IEvent } from '../../interfaces';

	// The trigger props come from bits-ui and must be spread onto whatever the
	// caller renders — the shadcn equivalent of Radix's `asChild`.
	let { event, children }: { event: IEvent; children: Snippet<[Record<string, unknown>]> } =
		$props();

	const calendar = getCalendarState();

	const startDate = $derived(parseISO(event.startDate));
	const endDate = $derived(parseISO(event.endDate));

	let open = $state(false);
	let confirming = $state(false);

	function handleDelete() {
		if (!confirming) {
			confirming = true;
			return;
		}

		calendar.deleteEvent(event.id);
		toastMutation(calendar, 'Event deleted');

		// Closing programmatically does not fire `onOpenChange`, so disarm here too.
		confirming = false;
		open = false;
	}
</script>

<!-- Closing must disarm Delete; reopening any event should never show it primed. -->
<Dialog.Root bind:open onOpenChange={(next) => !next && (confirming = false)}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			{@render children(props)}
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{event.title}</Dialog.Title>
			<Dialog.Description class="sr-only">Details for {event.title}</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="flex items-start gap-2">
				<UserIcon class="mt-1 size-4 shrink-0" />
				<div>
					<p class="text-sm font-medium">Responsible</p>
					<p class="text-muted-foreground text-sm">{event.user.name}</p>
				</div>
			</div>

			<div class="flex items-start gap-2">
				<CalendarIcon class="mt-1 size-4 shrink-0" />
				<div>
					<p class="text-sm font-medium">Start Date</p>
					<p class="text-muted-foreground text-sm">{format(startDate, 'MMM d, yyyy h:mm a')}</p>
				</div>
			</div>

			<div class="flex items-start gap-2">
				<ClockIcon class="mt-1 size-4 shrink-0" />
				<div>
					<p class="text-sm font-medium">End Date</p>
					<p class="text-muted-foreground text-sm">{format(endDate, 'MMM d, yyyy h:mm a')}</p>
				</div>
			</div>

			<div class="flex items-start gap-2">
				<TextIcon class="mt-1 size-4 shrink-0" />
				<div>
					<p class="text-sm font-medium">Description</p>
					<p class="text-muted-foreground text-sm">{event.description}</p>
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button type="button" variant="destructive" onclick={handleDelete}>
				{confirming ? 'Click again to confirm' : 'Delete'}
			</Button>

			<EditEventDialog {event}>
				{#snippet children(triggerProps)}
					<Button {...triggerProps} type="button" variant="outline">Edit</Button>
				{/snippet}
			</EditEventDialog>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
