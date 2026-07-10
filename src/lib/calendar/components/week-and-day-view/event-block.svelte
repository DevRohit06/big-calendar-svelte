<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const calendarWeekEventCardVariants = tv({
		base: 'flex select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
		variants: {
			color: {
				// Colored and mixed variants
				blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 [&_.event-dot]:fill-blue-600',
				green:
					'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300 [&_.event-dot]:fill-green-600',
				red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 [&_.event-dot]:fill-red-600',
				yellow:
					'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 [&_.event-dot]:fill-yellow-600',
				purple:
					'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 [&_.event-dot]:fill-purple-600',
				orange:
					'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 [&_.event-dot]:fill-orange-600',
				gray: 'border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 [&_.event-dot]:fill-neutral-600',

				// Dot variants
				'blue-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-blue-600',
				'green-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-green-600',
				'red-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-red-600',
				'orange-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-orange-600',
				'purple-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-purple-600',
				'yellow-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-yellow-600',
				'gray-dot': 'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-neutral-600'
			}
		},
		defaultVariants: {
			color: 'blue-dot'
		}
	});

	type BlockColor = VariantProps<typeof calendarWeekEventCardVariants>['color'];
</script>

<script lang="ts">
	import { format, differenceInMinutes, parseISO } from 'date-fns';

	import { getCalendarState } from '../../contexts/calendar-context.svelte';
	import { toastMutation } from '../../notifications';

	import DraggableEvent from '../dnd/draggable-event.svelte';
	import EventDetailsDialog from '../dialogs/event-details-dialog.svelte';

	import { PX_PER_MINUTE, SLOT_MINUTES, resizeEvent } from '../dnd/dnd';

	import { cn } from '$lib/utils';

	import type { IEvent } from '../../interfaces';

	let { event, class: className }: { event: IEvent; class?: string } = $props();

	const calendar = getCalendarState();

	// A resize in flight is previewed locally and only committed on pointerup,
	// so dragging an edge doesn't churn `updateEvent` on every pointermove.
	let preview = $state<IEvent | null>(null);
	let resizing = $state(false);

	const shown = $derived(preview ?? event);
	const start = $derived(parseISO(shown.startDate));
	const end = $derived(parseISO(shown.endDate));
	const durationInMinutes = $derived(differenceInMinutes(end, start));
	const heightInPixels = $derived(durationInMinutes * PX_PER_MINUTE - 8);

	// The parent positions this block from the committed start time, so a preview
	// that drags the start edge has to shift itself to stay under the pointer.
	const offsetInPixels = $derived(
		differenceInMinutes(start, parseISO(event.startDate)) * PX_PER_MINUTE
	);

	const color = $derived(
		(calendar.badgeVariant === 'dot' ? `${event.color}-dot` : event.color) as BlockColor
	);

	const classes = $derived(
		cn(
			calendarWeekEventCardVariants({ color, class: className }),
			durationInMinutes < 35 && 'py-0 justify-center'
		)
	);

	function startResize(edge: 'start' | 'end') {
		return (pointer: PointerEvent) => {
			if (pointer.button !== 0) return;

			// Suppresses the native drag that would otherwise start on the
			// draggable ancestor. `canDrag` below covers browsers that ignore this.
			pointer.preventDefault();
			pointer.stopPropagation();

			const handle = pointer.currentTarget as HTMLElement;
			const originY = pointer.clientY;

			resizing = true;
			handle.setPointerCapture(pointer.pointerId);

			const onMove = (move: PointerEvent) => {
				preview = resizeEvent(event, edge, (move.clientY - originY) / PX_PER_MINUTE);
			};

			const onEnd = () => {
				handle.removeEventListener('pointermove', onMove);
				handle.removeEventListener('pointerup', onEnd);
				handle.removeEventListener('pointercancel', onEnd);

				if (preview) {
					calendar.updateEvent(preview);
					toastMutation(calendar, 'Event resized');
				}

				preview = null;
				resizing = false;
			};

			handle.addEventListener('pointermove', onMove);
			handle.addEventListener('pointerup', onEnd);
			handle.addEventListener('pointercancel', onEnd);
		};
	}

	function resizeByKey(edge: 'start' | 'end') {
		return (key: KeyboardEvent) => {
			if (key.key !== 'ArrowUp' && key.key !== 'ArrowDown') return;

			key.preventDefault();
			key.stopPropagation();

			const step = key.key === 'ArrowUp' ? -SLOT_MINUTES : SLOT_MINUTES;
			calendar.updateEvent(resizeEvent(event, edge, step));
			toastMutation(calendar, 'Event resized');
		};
	}

	const handleClasses =
		'absolute inset-x-0 h-1.5 cursor-ns-resize touch-none rounded-sm bg-primary/50 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';
</script>

<DraggableEvent {event} canDrag={!resizing}>
	<div class="group relative" style="transform: translateY({offsetInPixels}px)">
		<EventDetailsDialog {event}>
			{#snippet children(triggerProps)}
				<div
					{...triggerProps}
					role="button"
					tabindex={0}
					class={classes}
					style="height: {heightInPixels}px"
				>
					<div class="flex items-center gap-1.5 truncate">
						{#if ['mixed', 'dot'].includes(calendar.badgeVariant)}
							<svg width="8" height="8" viewBox="0 0 8 8" class="event-dot shrink-0">
								<circle cx="4" cy="4" r="4" />
							</svg>
						{/if}

						<p class="truncate font-semibold">{event.title}</p>
					</div>

					{#if durationInMinutes > 25}
						<p>{format(start, 'h:mm a')} - {format(end, 'h:mm a')}</p>
					{/if}
				</div>
			{/snippet}
		</EventDetailsDialog>

		<button
			type="button"
			aria-label="Resize start time of {event.title}"
			class={cn(handleClasses, 'top-0 group-hover:opacity-100')}
			onpointerdown={startResize('start')}
			onkeydown={resizeByKey('start')}
		></button>

		<button
			type="button"
			aria-label="Resize end time of {event.title}"
			class={cn(handleClasses, 'bottom-0 group-hover:opacity-100')}
			onpointerdown={startResize('end')}
			onkeydown={resizeByKey('end')}
		></button>
	</div>
</DraggableEvent>
