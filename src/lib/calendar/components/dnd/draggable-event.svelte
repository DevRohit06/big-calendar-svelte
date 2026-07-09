<script lang="ts" module>
	export const ItemTypes = {
		EVENT: 'event'
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IEvent } from '../../interfaces';

	// TODO(dnd): wire up @neodrag/svelte. Until then this renders its child
	// untouched, so the views are complete apart from dragging.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { event, children }: { event: IEvent; children: Snippet } = $props();
</script>

<div>
	{@render children()}
</div>
