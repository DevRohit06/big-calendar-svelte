<script lang="ts">
	import { parseISO } from 'date-fns';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';

	import EventFormFields from './event-form-fields.svelte';

	import { eventSchema } from '../../schemas';

	import type { Snippet } from 'svelte';
	import type { IEvent } from '../../interfaces';

	let { event, children }: { event: IEvent; children: Snippet<[Record<string, unknown>]> } =
		$props();

	let open = $state(false);

	const calendar = getCalendarState();

	// The dialog is mounted per event and seeds its form once, mirroring the
	// React version's `defaultValues`. Later prop changes are intentionally ignored.
	// svelte-ignore state_referenced_locally
	const start = parseISO(event.startDate);
	// svelte-ignore state_referenced_locally
	const end = parseISO(event.endDate);

	// svelte-ignore state_referenced_locally
	const form = superForm(
		defaults(
			{
				user: event.user.id,
				title: event.title,
				description: event.description,
				startDate: start,
				startTime: { hour: start.getHours(), minute: start.getMinutes() },
				endDate: end,
				endTime: { hour: end.getHours(), minute: end.getMinutes() },
				color: event.color
			},
			zod4(eventSchema)
		),
		{
			SPA: true,
			// `startTime`/`endTime` are nested objects and the dates are Date
			// instances; superforms needs json to carry those unflattened.
			dataType: 'json',
			id: `edit-event-${event.id}`,
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

				calendar.updateEvent({
					...event,
					user,
					title: values.title,
					color: values.color,
					description: values.description,
					startDate: startDateTime.toISOString(),
					endDate: endDateTime.toISOString()
				});

				open = false;
			}
		}
	);

	const { enhance } = form;

	// svelte-ignore state_referenced_locally
	const formId = `edit-event-form-${event.id}`;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			{@render children(props)}
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Edit Event</Dialog.Title>
			<Dialog.Description>
				<TriangleAlertIcon class="mr-1 inline-block size-4 text-yellow-500" />
				This form is for demonstration purposes only. In a real application, submit the form to the backend
				API to save the event.
			</Dialog.Description>
		</Dialog.Header>

		<form id={formId} method="POST" use:enhance class="grid gap-4 py-4">
			<EventFormFields {form} />
		</form>

		<Dialog.Footer>
			<Dialog.Close>
				{#snippet child({ props })}
					<Button {...props} type="button" variant="outline">Cancel</Button>
				{/snippet}
			</Dialog.Close>

			<Button form={formId} type="submit">Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
