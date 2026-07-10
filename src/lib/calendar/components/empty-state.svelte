<script lang="ts">
	import type { Component } from 'svelte';
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/utils';

	// `children` is the call to action. An empty state that only says "nothing
	// here" leaves the user to go and find the button themselves.
	let {
		icon: Icon,
		title,
		description,
		class: className,
		children
	}: {
		icon: Component<{ class?: string }>;
		title: string;
		description?: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div class={cn('flex flex-col items-center justify-center gap-2 text-center', className)}>
	<Icon class="text-muted-foreground size-10" />

	<p class="text-foreground text-sm font-medium md:text-base">{title}</p>

	{#if description}
		<p class="text-muted-foreground max-w-xs text-sm">{description}</p>
	{/if}

	{#if children}
		<div class="mt-2">{@render children()}</div>
	{/if}
</div>
