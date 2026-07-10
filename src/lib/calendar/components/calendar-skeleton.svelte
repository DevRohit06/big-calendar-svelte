<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';

	import type { TCalendarView } from '../types';

	// A static, hand-rolled skeleton rather than a measured one. The considered
	// alternative, @shimmer-from-structure/svelte, calls `$effect` in a way that
	// throws `effect_orphan` under SSR, so every server-rendered page 500s with it
	// wrapped around the grid. This costs no runtime measurement and no dependency.
	let { view }: { view: TCalendarView } = $props();

	// Ranges rather than arrays of `undefined`, so the `#each` binds an index it
	// actually uses and eslint has no unused placeholder to complain about. Six
	// rows is the tallest a month grid gets, so the skeleton never jumps shorter
	// than the real thing.
	const monthCells = Array.from({ length: 42 }, (_, i) => i);
	const hourRows = Array.from({ length: 10 }, (_, i) => i);
	const agendaRows = Array.from({ length: 6 }, (_, i) => i);
	const dayColumns = $derived(Array.from({ length: view === 'week' ? 7 : 1 }, (_, i) => i));
</script>

{#if view === 'month' || view === 'year'}
	<div class="grid grid-cols-7 gap-px p-1" aria-hidden="true">
		{#each monthCells as cell (cell)}
			<Skeleton class="h-24 rounded-md" />
		{/each}
	</div>
{:else if view === 'agenda'}
	<div class="space-y-6 p-4" aria-hidden="true">
		{#each agendaRows as row (row)}
			<div class="space-y-2">
				<Skeleton class="h-4 w-32 rounded" />
				<Skeleton class="h-16 w-full rounded-md" />
			</div>
		{/each}
	</div>
{:else}
	<!-- day and week: a time column beside one or seven day columns -->
	<div class="flex p-1" aria-hidden="true">
		<div class="w-18 shrink-0 space-y-6 pt-3 pr-2">
			{#each hourRows as row (row)}
				<Skeleton class="ml-auto h-3 w-10 rounded" />
			{/each}
		</div>

		<div class="grid flex-1 gap-px {view === 'week' ? 'grid-cols-7' : 'grid-cols-1'}">
			{#each dayColumns as column (column)}
				<div class="space-y-6 py-3">
					{#each hourRows as row (row)}
						<Skeleton
							class="h-10 w-full rounded-md {row % 3 === 0 ? 'opacity-100' : 'opacity-60'}"
						/>
					{/each}
				</div>
			{/each}
		</div>
	</div>
{/if}
