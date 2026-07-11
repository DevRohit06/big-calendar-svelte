<script lang="ts">
	import VideoIcon from '@lucide/svelte/icons/video';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';
	import { getMeetingMeta } from '../../location';

	import * as Avatar from '$lib/components/ui/avatar';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Button } from '$lib/components/ui/button';
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

	// Live platform preview for the meeting link (favicon + name), null until the
	// URL parses as an absolute URL.
	const meetingMeta = $derived(
		$formData.location.type === 'online' && $formData.location.url.trim()
			? getMeetingMeta($formData.location.url)
			: null
	);

	// Open the Location section by default when editing an event that already has
	// one, so it is not hidden behind a collapsed accordion.
	const hasLocation = $formData.location.url.trim() || $formData.location.address.trim();
	let locationSection = $state<string | undefined>(hasLocation ? 'location' : undefined);
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

<Accordion.Root type="single" bind:value={locationSection}>
	<Accordion.Item value="location">
		<Accordion.Trigger>
			<span class="flex items-center gap-2">
				{#if $formData.location.type === 'online'}
					<VideoIcon class="size-4" />
				{:else}
					<MapPinIcon class="size-4" />
				{/if}
				Location <span class="text-muted-foreground font-normal">(optional)</span>
			</span>
		</Accordion.Trigger>

		<Accordion.Content class="grid gap-4 px-4 pb-4">
			<div class="flex gap-2">
				<Button
					type="button"
					size="sm"
					variant={$formData.location.type === 'online' ? 'default' : 'outline'}
					class="flex-1"
					onclick={() => ($formData.location.type = 'online')}
				>
					<VideoIcon class="size-4" />
					Online
				</Button>
				<Button
					type="button"
					size="sm"
					variant={$formData.location.type === 'physical' ? 'default' : 'outline'}
					class="flex-1"
					onclick={() => ($formData.location.type = 'physical')}
				>
					<MapPinIcon class="size-4" />
					In person
				</Button>
			</div>

			{#if $formData.location.type === 'online'}
				<Form.Field {form} name="location.url">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Meeting link</Form.Label>
							<Input
								{...props}
								type="url"
								placeholder="https://zoom.us/j/…"
								bind:value={$formData.location.url}
							/>
						{/snippet}
					</Form.Control>
					{#if meetingMeta}
						<div class="text-muted-foreground flex items-center gap-2 text-sm">
							<img src={meetingMeta.faviconUrl} alt="" class="size-4 rounded-sm" />
							<span>{meetingMeta.label}</span>
						</div>
					{/if}
					<Form.FieldErrors />
				</Form.Field>
			{:else}
				<Form.Field {form} name="location.address">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Address</Form.Label>
							<Textarea
								{...props}
								placeholder="123 Main St, City, Country"
								bind:value={$formData.location.address}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{/if}
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
