<script lang="ts">
	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	import * as Avatar from '$lib/components/ui/avatar';
	import * as Select from '$lib/components/ui/select';

	const MAX_AVATARS = 2;

	const calendar = getCalendarState();

	// shadcn-svelte has no <SelectValue>; the trigger renders its own label.
	const selectedUser = $derived(calendar.users.find((u) => u.id === calendar.selectedUserId));
</script>

<Select.Root type="single" bind:value={calendar.selectedUserId}>
	<Select.Trigger class="flex-1 md:w-48">
		{#if selectedUser}
			<div class="flex items-center gap-2">
				<Avatar.Root class="size-6">
					<Avatar.Image src={selectedUser.picturePath ?? undefined} alt={selectedUser.name} />
					<Avatar.Fallback class="text-xxs">{selectedUser.name[0]}</Avatar.Fallback>
				</Avatar.Root>
				<p class="truncate">{selectedUser.name}</p>
			</div>
		{:else}
			<div class="flex items-center gap-1">
				<Avatar.Group>
					{#each calendar.users.slice(0, MAX_AVATARS) as user (user.id)}
						<Avatar.Root class="text-xxs size-6">
							<Avatar.Image src={user.picturePath ?? undefined} alt={user.name} />
							<Avatar.Fallback class="text-xxs">{user.name[0]}</Avatar.Fallback>
						</Avatar.Root>
					{/each}

					{#if calendar.users.length > MAX_AVATARS}
						<Avatar.GroupCount class="text-xxs size-6">
							+{calendar.users.length - MAX_AVATARS}
						</Avatar.GroupCount>
					{/if}
				</Avatar.Group>
				All
			</div>
		{/if}
	</Select.Trigger>

	<Select.Content align="end">
		<Select.Item value="all" label="All">
			<div class="flex items-center gap-1">
				<Avatar.Group>
					{#each calendar.users.slice(0, MAX_AVATARS) as user (user.id)}
						<Avatar.Root class="text-xxs size-6">
							<Avatar.Image src={user.picturePath ?? undefined} alt={user.name} />
							<Avatar.Fallback class="text-xxs">{user.name[0]}</Avatar.Fallback>
						</Avatar.Root>
					{/each}

					{#if calendar.users.length > MAX_AVATARS}
						<Avatar.GroupCount class="text-xxs size-6">
							+{calendar.users.length - MAX_AVATARS}
						</Avatar.GroupCount>
					{/if}
				</Avatar.Group>
				All
			</div>
		</Select.Item>

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
