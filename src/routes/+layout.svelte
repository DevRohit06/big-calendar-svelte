<script lang="ts">
	import './layout.css';
	import SettingsIcon from '@lucide/svelte/icons/settings';

	import favicon from '$lib/assets/favicon.svg';
	import CalendarProvider from '$lib/calendar/contexts/calendar-provider.svelte';

	import * as Accordion from '$lib/components/ui/accordion';
	import ChangeBadgeVariantInput from '$lib/calendar/components/change-badge-variant-input.svelte';
	import ChangeVisibleHoursInput from '$lib/calendar/components/change-visible-hours-input.svelte';
	import ChangeWorkingHoursInput from '$lib/calendar/components/change-working-hours-input.svelte';

	import type { Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';

	let { data, children }: { data: LayoutServerData; children: Snippet } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<CalendarProvider users={data.users} events={data.events}>
	<div class="mx-auto flex max-w-[90rem] flex-col gap-4 px-8 py-4">
		{@render children()}

		<Accordion.Root type="single">
			<Accordion.Item value="item-1" class="border-none">
				<Accordion.Trigger class="flex-none gap-2 py-0 hover:no-underline">
					<div class="flex items-center gap-2">
						<SettingsIcon class="size-4" />
						<p class="text-base font-semibold">Calendar settings</p>
					</div>
				</Accordion.Trigger>

				<Accordion.Content>
					<div class="mt-4 flex flex-col gap-6">
						<ChangeBadgeVariantInput />
						<ChangeVisibleHoursInput />
						<ChangeWorkingHoursInput />
					</div>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</div>
</CalendarProvider>
