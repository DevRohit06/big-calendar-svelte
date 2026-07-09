<script lang="ts">
	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import * as Avatar from '$lib/components/ui/avatar';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { TimeInput } from '$lib/components/ui/time-input';
	import { SingleDayPicker } from '$lib/components/ui/single-day-picker';

	import type { SuperForm } from 'sveltekit-superforms';
	import type { TEventFormData } from '../../schemas';

	// Both the add and edit dialogs render exactly these fields; only the
	// surrounding dialog shell and the submit handler differ.
	let { form }: { form: SuperForm<TEventFormData> } = $props();

	// The SuperForm instance is stable for the lifetime of the dialog.
	// svelte-ignore state_referenced_locally
	const { form: formData } = form;

	const calendar = getCalendarState();

	const COLORS = [
		{ value: 'blue', label: 'Blue', dot: 'bg-blue-600' },
		{ value: 'green', label: 'Green', dot: 'bg-green-600' },
		{ value: 'red', label: 'Red', dot: 'bg-red-600' },
		{ value: 'yellow', label: 'Yellow', dot: 'bg-yellow-600' },
		{ value: 'purple', label: 'Purple', dot: 'bg-purple-600' },
		{ value: 'orange', label: 'Orange', dot: 'bg-orange-600' },
		{ value: 'gray', label: 'Gray', dot: 'bg-neutral-600' }
	] as const;

	const selectedUser = $derived(calendar.users.find((u) => u.id === $formData.user));
	const selectedColor = $derived(COLORS.find((c) => c.value === $formData.color));
</script>

<Form.Field {form} name="user">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>Responsible</Form.Label>

			<Select.Root type="single" bind:value={$formData.user} name={props.name}>
				<Select.Trigger {...props} class="w-full">
					{#if selectedUser}
						<div class="flex items-center gap-2">
							<Avatar.Root class="size-6">
								<Avatar.Image src={selectedUser.picturePath ?? undefined} alt={selectedUser.name} />
								<Avatar.Fallback class="text-xxs">{selectedUser.name[0]}</Avatar.Fallback>
							</Avatar.Root>
							<p class="truncate">{selectedUser.name}</p>
						</div>
					{:else}
						<span class="text-muted-foreground">Select an option</span>
					{/if}
				</Select.Trigger>

				<Select.Content>
					{#each calendar.users as user (user.id)}
						<Select.Item value={user.id} label={user.name} class="flex-1">
							<div class="flex items-center gap-2">
								<Avatar.Root class="size-6">
									<Avatar.Image src={user.picturePath ?? undefined} alt={user.name} />
									<Avatar.Fallback class="text-xxs">{user.name[0]}</Avatar.Fallback>
								</Avatar.Root>

								<p class="truncate">{user.name}</p>
							</div>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>

<Form.Field {form} name="title">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>Title</Form.Label>
			<Input {...props} placeholder="Enter a title" bind:value={$formData.title} />
		{/snippet}
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>

<div class="flex items-start gap-2">
	<Form.Field {form} name="startDate" class="flex-1">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Start Date</Form.Label>
				<SingleDayPicker
					{...props}
					value={$formData.startDate}
					onSelect={(date) => ($formData.startDate = date as Date)}
					placeholder="Select a date"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="startTime" class="flex-1">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Start Time</Form.Label>
				<TimeInput
					{...props}
					hourCycle={12}
					value={$formData.startTime}
					onChange={(value) => value && ($formData.startTime = value)}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</div>

<div class="flex items-start gap-2">
	<Form.Field {form} name="endDate" class="flex-1">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>End Date</Form.Label>
				<SingleDayPicker
					{...props}
					value={$formData.endDate}
					onSelect={(date) => ($formData.endDate = date as Date)}
					placeholder="Select a date"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="endTime" class="flex-1">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>End Time</Form.Label>
				<TimeInput
					{...props}
					hourCycle={12}
					value={$formData.endTime}
					onChange={(value) => value && ($formData.endTime = value)}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</div>

<Form.Field {form} name="color">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>Color</Form.Label>

			<Select.Root type="single" bind:value={$formData.color} name={props.name}>
				<Select.Trigger {...props} class="w-full">
					{#if selectedColor}
						<div class="flex items-center gap-2">
							<div class="size-3.5 rounded-full {selectedColor.dot}"></div>
							{selectedColor.label}
						</div>
					{:else}
						<span class="text-muted-foreground">Select an option</span>
					{/if}
				</Select.Trigger>

				<Select.Content>
					{#each COLORS as color (color.value)}
						<Select.Item value={color.value} label={color.label}>
							<div class="flex items-center gap-2">
								<div class="size-3.5 rounded-full {color.dot}"></div>
								{color.label}
							</div>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>

<Form.Field {form} name="description">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>Description</Form.Label>
			<Textarea {...props} bind:value={$formData.description} />
		{/snippet}
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>
