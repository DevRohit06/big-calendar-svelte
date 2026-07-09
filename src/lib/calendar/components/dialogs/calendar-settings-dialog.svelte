<script lang="ts">
	import SettingsIcon from '@lucide/svelte/icons/settings';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Separator } from '$lib/components/ui/separator';

	import ChangeBadgeVariantInput from '../change-badge-variant-input.svelte';
	import ChangeVisibleHoursInput from '../change-visible-hours-input.svelte';
	import ChangeWorkingHoursInput from '../change-working-hours-input.svelte';
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="icon" aria-label="Calendar settings">
				<SettingsIcon strokeWidth={1.8} />
			</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Calendar settings</Dialog.Title>
			<Dialog.Description>Changes apply immediately.</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-6 py-2">
			<ChangeBadgeVariantInput />
			<Separator />
			<ChangeVisibleHoursInput />
			<Separator />
			<ChangeWorkingHoursInput />
		</div>
	</Dialog.Content>
</Dialog.Root>
