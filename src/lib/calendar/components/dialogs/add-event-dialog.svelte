<script lang="ts">
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4, zod4Client } from 'sveltekit-superforms/adapters';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';

	import EventFormFields from './event-form-fields.svelte';

	import { eventSchema } from '../../schemas';

	import type { Snippet } from 'svelte';

	let {
		startDate,
		startTime,
		children
	}: {
		startDate?: Date;
		startTime?: { hour: number; minute: number };
		children: Snippet<[Record<string, unknown>]>;
	} = $props();

	let open = $state(false);

	// Seeds the form once from the clicked time slot, like the React version's
	// `defaultValues` plus its `form.reset` effect.
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
				endDate: undefined,
				endTime: undefined,
				color: undefined
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
				// TO DO: Create an add-event action. The React version is a no-op too.
				open = false;
				form.reset();
			}
		}
	);

	const { enhance } = form;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			{@render children(props)}
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Add New Event</Dialog.Title>
			<Dialog.Description>
				<TriangleAlertIcon class="mr-1 inline-block size-4 text-yellow-500" />
				This form is for demonstration purposes only and will not actually create an event. In a real
				application, submit the form to the backend API to save the event.
			</Dialog.Description>
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
