<script lang="ts">
	import type { Snippet } from 'svelte';

	// TODO(dnd): mount the custom drag layer here once dragging is implemented.
	// react-dnd needed a provider at the root; neodrag does not, so this stays
	// a plain wrapper and may well be deleted at the end of the DnD pass.
	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
