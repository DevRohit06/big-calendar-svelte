<script lang="ts">
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';
	import { toastMutation } from '../../notifications';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';

	import EventFormFields from './event-form-fields.svelte';

	import { eventSchema } from '../../schemas';
	import { toEventLocation } from '../../location';

	import type { Snippet } from 'svelte';

	// `children` is the trigger. Omit it and the dialog is driven entirely by
	// `open` — that is how a drag across empty slots opens it, with no element to
	// have clicked.
	let {
		open = $bindable(false),
		startDate,
		startTime,
		endDate,
		endTime,
		children
	}: {
		open?: boolean;
		startDate?: Date;
		startTime?: { hour: number; minute: number };
		endDate?: Date;
		endTime?: { hour: number; minute: number };
		children?: Snippet<[Record<string, unknown>]>;
	} = $props();

	const calendar = getCalendarState();

	// Seeds the form once from the clicked time slot, like the React version's
	// `defaultValues` plus its `form.reset` effect. Callers that need a different
	// seed mount a fresh instance rather than reassigning these props.
	// svelte-ignore state_referenced_locally
	// The explicit `undefined`s override superforms' schema defaults, which would
	// otherwise prefill End Time as 12:00 AM and Color as the first enum member.
	// React left these empty, showing their placeholders.
	const form = superForm(
		defaults(
			{
				user: '',
				title: '',
				description: '',
				startDate,
				startTime,
				endDate,
				endTime,
				color: undefined,
				location: { type: 'online', url: '', address: '' }
			},
			zod4(eventSchema)
		),
		{
			SPA: true,
			// `startTime`/`endTime` are nested objects and the dates are Date
			// instances; superforms needs json to carry those unflattened.
			dataType: 'json',
			id: 'add-event',
			validators: zod4Client(eventSchema),
			resetForm: false,
			onUpdate({ form: validated }) {
				if (!validated.valid) return;

				const values = validated.data;
				const user = calendar.users.find((u) => u.id === values.user);
				if (!user) throw new Error('User not found');

				// Throwaway Dates, read once as ISO strings below.
				/* eslint-disable svelte/prefer-svelte-reactivity */
				const startDateTime = new Date(values.startDate);
				startDateTime.setHours(values.startTime.hour, values.startTime.minute);

				const endDateTime = new Date(values.endDate);
				endDateTime.setHours(values.endTime.hour, values.endTime.minute);
				/* eslint-enable svelte/prefer-svelte-reactivity */

				calendar.addEvent({
					user,
					title: values.title,
					color: values.color,
					description: values.description,
					startDate: startDateTime.toISOString(),
					endDate: endDateTime.toISOString(),
					location: toEventLocation(values.location)
				});

				toastMutation(calendar, 'Event created');
				open = false;
				form.reset();
			}
		}
	);

	const { enhance } = form;
</script>

<Dialog.Root bind:open>
	{#if children}
		<Dialog.Trigger>
			{#snippet child({ props })}
				{@render children(props)}
			{/snippet}
		</Dialog.Trigger>
	{/if}

	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Add New Event</Dialog.Title>
			<Dialog.Description>Events are saved in this browser only.</Dialog.Description>
		</Dialog.Header>

		<form id="add-event-form" method="POST" use:enhance class="grid gap-4 py-4">
			<EventFormFields {form} />
		</form>

		<Dialog.Footer>
			<Dialog.Close>
				{#snippet child({ props })}
					<Button {...props} type="button" variant="outline">Cancel</Button>
				{/snippet}
			</Dialog.Close>

			<Button form="add-event-form" type="submit">Create Event</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
