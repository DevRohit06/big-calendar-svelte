<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';

	import { Button } from '$lib/components/ui/button';
</script>

<Button onclick={toggleMode} variant="outline" size="icon" aria-label="Toggle theme">
	<SunIcon class="dark:hidden" />
	<MoonIcon class="hidden dark:block" />
</Button>
