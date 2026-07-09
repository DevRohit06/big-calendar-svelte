<script lang="ts">
	import { formatDate } from 'date-fns';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';

	const calendar = getCalendarState();

	const today = new Date();
</script>

<button
	class="focus-visible:ring-ring flex size-14 flex-col items-start overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-1"
	onclick={() => calendar.selectDate(today)}
>
	<p
		class="bg-primary text-primary-foreground flex h-6 w-full items-center justify-center text-center text-xs font-semibold"
	>
		{formatDate(today, 'MMM').toUpperCase()}
	</p>
	<p class="flex w-full items-center justify-center text-lg font-bold">{today.getDate()}</p>
</button>
