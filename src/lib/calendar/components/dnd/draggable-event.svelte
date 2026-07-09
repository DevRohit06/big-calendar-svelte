<script lang="ts">
	import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
	import type { Snippet } from 'svelte';

	import { eventDragData } from './dnd';

	import { cn } from '$lib/utils';

	import type { IEvent } from '../../interfaces';

	let {
		event,
		canDrag = true,
		children
	}: { event: IEvent; canDrag?: boolean; children: Snippet } = $props();

	let dragging = $state(false);

	// `event` and `canDrag` are read inside the callbacks rather than during
	// setup, so the attachment binds once instead of re-running on every change.
	function dragSource(element: HTMLElement) {
		return draggable({
			element,
			canDrag: () => canDrag,
			getInitialData: () => eventDragData(event),
			onDragStart: () => (dragging = true),
			onDrop: () => (dragging = false)
		});
	}
</script>

<div
	{@attach dragSource}
	class={cn(canDrag && 'cursor-grab active:cursor-grabbing', dragging && 'opacity-50')}
>
	{@render children()}
</div>
