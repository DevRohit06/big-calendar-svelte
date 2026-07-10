<script lang="ts">
	import SettingsIcon from '@lucide/svelte/icons/settings';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';
	import { getEvents } from '../../requests';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';

	import ChangeBadgeVariantInput from '../change-badge-variant-input.svelte';
	import ChangeVisibleHoursInput from '../change-visible-hours-input.svelte';
	import ChangeWorkingHoursInput from '../change-working-hours-input.svelte';

	const calendar = getCalendarState();

	let open = $state(false);
	let confirming = $state(false);

	// Resetting throws away every edit the visitor made, so make them say it twice.
	async function handleReset() {
		if (!confirming) {
			confirming = true;
			return;
		}

		calendar.reset(await getEvents());

		// Closing programmatically does not fire `onOpenChange`, so disarm here too.
		confirming = false;
		open = false;
	}
</script>

<!-- Closing must disarm the reset button; reopening should never show it primed. -->
<Dialog.Root bind:open onOpenChange={(next) => !next && (confirming = false)}>
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
			<Separator />

			<div class="space-y-2">
				<Label>Sample data</Label>

				<p class="text-muted-foreground text-sm">
					Your events are saved in this browser. Resetting discards every change you have made.
				</p>

				<Button variant="destructive" size="sm" onclick={handleReset}>
					{confirming ? 'Click again to confirm' : 'Reset to sample data'}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
