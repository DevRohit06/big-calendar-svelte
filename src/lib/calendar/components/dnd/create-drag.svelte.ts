import { createDragRange, createDragTimes, slotFromOffset } from './dnd';

export type CreateDragComplete = (start: Date, end: Date) => void;

type StartOptions = {
	day: Date;
	dayKey: string;
	minutes: number;
	column: HTMLElement;
	fromHour: number;
	toHour: number;
};

/**
 * Dragging across empty grid slots to block out a new event.
 *
 * One instance per view, shared by every column in it, because only one such
 * drag can be in flight at a time. The gesture is locked to the column it
 * started in — a create-drag belongs to a single day, and sliding sideways into
 * Wednesday should not silently rewrite which day you are booking.
 */
export class CreateDrag {
	#onComplete: CreateDragComplete;

	// Plain fields, not `$state`: nothing renders from them, and a Date here
	// would trip `prefer-svelte-reactivity` for no benefit.
	#day: Date | null = null;
	#column: HTMLElement | null = null;
	#anchorMinutes = 0;
	#fromHour = 0;
	#toHour = 24;

	/** The `yyyy-MM-dd` of the column being dragged in, or null when idle. */
	dayKey = $state<string | null>(null);
	fromMinutes = $state(0);
	toMinutes = $state(0);

	constructor(onComplete: CreateDragComplete) {
		this.#onComplete = onComplete;
	}

	start(options: StartOptions) {
		this.#day = options.day;
		this.#column = options.column;
		this.#anchorMinutes = options.minutes;
		this.#fromHour = options.fromHour;
		this.#toHour = options.toHour;

		this.dayKey = options.dayKey;
		this.#setRange(options.minutes);

		// On the window rather than the slot: the pointer spends most of the drag
		// over other elements, and often finishes outside the column entirely.
		window.addEventListener('pointermove', this.#onPointerMove);
		window.addEventListener('pointerup', this.#onPointerUp);
		window.addEventListener('pointercancel', this.#cancel);
		window.addEventListener('keydown', this.#onKeyDown);
	}

	#setRange(pointerMinutes: number) {
		const { from, to } = createDragRange(this.#anchorMinutes, pointerMinutes);
		this.fromMinutes = from;
		this.toMinutes = to;
	}

	#onPointerMove = (event: PointerEvent) => {
		if (!this.#column) return;

		const rect = this.#column.getBoundingClientRect();
		this.#setRange(
			slotFromOffset(event.clientY - rect.top, rect.height, this.#fromHour, this.#toHour)
		);
	};

	#onPointerUp = () => {
		const day = this.#day;
		const { fromMinutes, toMinutes } = this;

		this.#teardown();

		if (!day) return;

		const { start, end } = createDragTimes(day, fromMinutes, toMinutes);
		this.#onComplete(start, end);
	};

	/** Escape abandons the gesture: no preview, no dialog, nothing created. */
	#onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape') return;

		event.preventDefault();
		this.#cancel();
	};

	#cancel = () => this.#teardown();

	#teardown() {
		window.removeEventListener('pointermove', this.#onPointerMove);
		window.removeEventListener('pointerup', this.#onPointerUp);
		window.removeEventListener('pointercancel', this.#cancel);
		window.removeEventListener('keydown', this.#onKeyDown);

		this.dayKey = null;
		this.#day = null;
		this.#column = null;
	}
}
