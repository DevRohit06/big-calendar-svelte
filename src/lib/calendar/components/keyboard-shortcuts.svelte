<script lang="ts" module>
	/** Shown in the `?` overlay. */
	export const SHORTCUTS = [
		{ keys: ['t'], description: 'Go to today' },
		{ keys: ['n'], description: 'New event' },
		{ keys: ['g', 'd'], description: 'Go to day view' },
		{ keys: ['g', 'w'], description: 'Go to week view' },
		{ keys: ['g', 'm'], description: 'Go to month view' },
		{ keys: ['g', 'y'], description: 'Go to year view' },
		{ keys: ['g', 'a'], description: 'Go to agenda view' },
		{ keys: ['←'], description: 'Previous day, week, month, or year' },
		{ keys: ['→'], description: 'Next day, week, month, or year' },
		{ keys: ['⌘', 'K'], description: 'Command palette' },
		{ keys: ['⌘', 'Z'], description: 'Undo' },
		{ keys: ['⇧', '⌘', 'Z'], description: 'Redo' },
		{ keys: ['?'], description: 'This list' }
	] as const;

	/** `g` followed by one of these jumps to that view. */
	const GO_TO = {
		d: '/day-view',
		w: '/week-view',
		m: '/month-view',
		y: '/year-view',
		a: '/agenda-view'
	} as const;

	/** How long a pressed `g` waits for its second key before giving up. */
	const CHORD_TIMEOUT_MS = 1500;
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';

	import { getCalendarState } from '../contexts/calendar-context.svelte';
	import { navigateDate, viewFromPath } from '../helpers';

	import * as Dialog from '$lib/components/ui/dialog';
	import AddEventDialog from './dialogs/add-event-dialog.svelte';

	const calendar = getCalendarState();

	let helpOpen = $state(false);
	let creating = $state(false);

	// Plain `let`: nothing renders from the chord, and it is read only inside the
	// handler that writes it.
	let chord: 'g' | null = null;
	let chordTimer: ReturnType<typeof setTimeout> | undefined;

	const view = $derived(viewFromPath(page.url.pathname));

	/**
	 * A shortcut must never eat a keystroke that belongs to the thing the user is
	 * typing into. Two cases, and both are real:
	 *
	 * 1. Focus is in a field — `n` there is a letter, and ⌘Z means "undo my
	 *    typing", not "undo my last event edit". Fields include `contenteditable`,
	 *    which is not a tag name.
	 * 2. A dialog is open — the event form, the details panel, the command palette.
	 *    bits-ui portals dialog content to `<body>` and traps focus inside it, so
	 *    `closest()` from the target catches the focused case; the document-wide
	 *    check catches the rest (a freshly opened dialog whose focus has not landed
	 *    yet still has content in the DOM).
	 */
	function shouldIgnore(target: EventTarget | null) {
		if (document.querySelector('[data-slot="dialog-content"]')) return true;
		if (!(target instanceof HTMLElement)) return false;
		if (target.isContentEditable) return true;
		if (target.closest('[role="dialog"]')) return true;

		return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
	}

	function armChord() {
		chord = 'g';
		clearTimeout(chordTimer);
		chordTimer = setTimeout(() => (chord = null), CHORD_TIMEOUT_MS);
	}

	function clearChord() {
		chord = null;
		clearTimeout(chordTimer);
	}

	function handleUndoRedo(event: KeyboardEvent) {
		const key = event.key.toLowerCase();
		const isUndo = key === 'z' && !event.shiftKey;
		// ⇧⌘Z is the mac redo; Ctrl+Y is the Windows one. Both, rather than either.
		const isRedo = (key === 'z' && event.shiftKey) || key === 'y';

		if (!isUndo && !isRedo) return;

		// Claim the keystroke even when there is nothing to undo, so the browser's
		// own history does not take it as a consolation prize.
		event.preventDefault();

		if (isUndo) {
			if (!calendar.canUndo) return;
			calendar.undo();
			toast('Change undone');
			return;
		}

		if (!calendar.canRedo) return;
		calendar.redo();
		toast('Change redone');
	}

	function handleKeydown(event: KeyboardEvent) {
		// `?` closes the overlay that `?` opened. Handled before `shouldIgnore`,
		// which would otherwise see the overlay's own dialog content and bail.
		if (helpOpen) {
			if (event.key === '?') {
				event.preventDefault();
				helpOpen = false;
			}
			return;
		}

		if (event.metaKey || event.ctrlKey) {
			if (!shouldIgnore(event.target)) handleUndoRedo(event);
			return;
		}

		// Alt-modified keys belong to the OS and the browser.
		if (event.altKey) return;
		if (shouldIgnore(event.target)) return;

		const key = event.key;

		// A pending `g` swallows whatever comes next: `g` then `q` is a mistyped
		// chord, not a bare `q` that should go to today.
		if (chord === 'g') {
			clearChord();

			const href = GO_TO[key.toLowerCase() as keyof typeof GO_TO];
			if (!href) return;

			event.preventDefault();
			goto(resolve(href));
			return;
		}

		if (key === '?') {
			event.preventDefault();
			helpOpen = true;
			return;
		}

		if (key === 'ArrowLeft' || key === 'ArrowRight') {
			// On a route that shows no calendar, the arrows are the browser's.
			if (!view) return;

			event.preventDefault();
			const direction = key === 'ArrowLeft' ? 'previous' : 'next';
			calendar.selectDate(navigateDate(calendar.selectedDate, view, direction));
			return;
		}

		switch (key.toLowerCase()) {
			case 'g':
				event.preventDefault();
				armChord();
				return;

			case 't':
				event.preventDefault();
				calendar.selectDate(new Date());
				return;

			case 'n':
				event.preventDefault();
				creating = true;
				return;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Dialog.Root bind:open={helpOpen}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Keyboard shortcuts</Dialog.Title>
			<Dialog.Description>
				These work anywhere except inside a text field or an open dialog.
			</Dialog.Description>
		</Dialog.Header>

		<dl class="grid gap-2">
			{#each SHORTCUTS as shortcut (shortcut.description)}
				<div class="flex items-center justify-between gap-4">
					<dt class="text-muted-foreground text-sm">{shortcut.description}</dt>
					<dd class="flex shrink-0 items-center gap-1">
						{#each shortcut.keys as key (key)}
							<kbd
								class="bg-muted text-foreground inline-flex h-6 min-w-6 items-center justify-center rounded border px-1.5 font-mono text-xs font-medium"
							>
								{key}
							</kbd>
						{/each}
					</dd>
				</div>
			{/each}
		</dl>
	</Dialog.Content>
</Dialog.Root>

<!-- Mounted on demand so the form is seeded fresh, and unmounted when closed. -->
{#if creating}
	<AddEventDialog bind:open={() => true, (next) => !next && (creating = false)} />
{/if}
