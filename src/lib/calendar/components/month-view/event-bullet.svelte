<script lang="ts" module>
	import { tv } from 'tailwind-variants';

	export const eventBulletVariants = tv({
		base: 'size-2 rounded-full',
		variants: {
			color: {
				blue: 'bg-blue-600 dark:bg-blue-500',
				green: 'bg-green-600 dark:bg-green-500',
				red: 'bg-red-600 dark:bg-red-500',
				yellow: 'bg-yellow-600 dark:bg-yellow-500',
				purple: 'bg-purple-600 dark:bg-purple-500',
				gray: 'bg-neutral-600 dark:bg-neutral-500',
				orange: 'bg-orange-600 dark:bg-orange-500'
			}
		},
		defaultVariants: {
			color: 'blue'
		}
	});
</script>

<script lang="ts">
	import type { TEventColor } from '../../types';

	let { color, class: className }: { color: TEventColor; class?: string } = $props();
</script>

<div class={eventBulletVariants({ color, class: className })}></div>
