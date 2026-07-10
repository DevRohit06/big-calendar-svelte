<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { getCalendarState } from '../contexts/calendar-context.svelte';

	const calendar = getCalendarState();

	/**
	 * A shortcut must never eat a keystroke that belongs to the thing the user is
	 * typing into. Two cases, and both are real:
	 *
	 * 1. Focus is in a field — ⌘Z there means "undo my typing", not "undo my last
	 *    event edit". Fields include `contenteditable`, which is not a tag name.
	 * 2. A dialog is open — the event form, the details panel, the command
	 *    palette. bits-ui portals dialog content to `<body>` and traps focus
	 *    inside it, so `closest()` from the target catches the focused case; the
	 *    document-wide check catches the rest (a freshly opened dialog whose
	 *    focus has not landed yet still has content in the DOM).
	 */
	function shouldIgnore(target: EventTarget | null) {
		if (document.querySelector('[data-slot="dialog-content"]')) return true;
		if (!(target instanceof HTMLElement)) return false;
		if (target.isContentEditable) return true;
		if (target.closest('[role="dialog"]')) return true;

		return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!event.metaKey && !event.ctrlKey) return;
		if (shouldIgnore(event.target)) return;

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
</script>

<svelte:window onkeydown={handleKeydown} />
