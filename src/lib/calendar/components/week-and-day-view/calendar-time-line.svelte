<script lang="ts">
	import { format } from 'date-fns';
	import { onMount } from 'svelte';

	let { firstVisibleHour, lastVisibleHour }: { firstVisibleHour: number; lastVisibleHour: number } =
		$props();

	let currentTime = $state(new Date());

	onMount(() => {
		const timer = setInterval(() => (currentTime = new Date()), 60 * 1000);
		return () => clearInterval(timer);
	});

	const currentTimePosition = $derived.by(() => {
		const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();

		const visibleStartMinutes = firstVisibleHour * 60;
		const visibleEndMinutes = lastVisibleHour * 60;
		const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;

		return ((minutes - visibleStartMinutes) / visibleRangeMinutes) * 100;
	});

	const isVisible = $derived(
		currentTime.getHours() >= firstVisibleHour && currentTime.getHours() < lastVisibleHour
	);
</script>

{#if isVisible}
	<div
		class="border-primary pointer-events-none absolute inset-x-0 z-50 border-t"
		style="top: {currentTimePosition}%"
	>
		<div
			class="bg-primary absolute left-0 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
		></div>
		<div
			class="bg-background text-primary absolute -left-18 flex w-16 -translate-y-1/2 justify-end pr-1 text-xs font-medium"
		>
			{format(currentTime, 'h:mm a')}
		</div>
	</div>
{/if}
