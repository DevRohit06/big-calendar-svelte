<script lang="ts" module>
	// Leaflet is loaded from a CDN at runtime rather than bundled, for the same
	// reason the calendar shell loads its shimmer library dynamically: it is a
	// browser-only library and must never enter the SSR module graph, which on
	// this project's Node runtime would 500 the page. Injecting the tags inside
	// `onMount` guarantees that — `onMount` never runs on the server.
	const LEAFLET_VERSION = '1.9.4';
	const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
	const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Leaflet = any;

	// One shared promise so the script/CSS are injected once no matter how many
	// maps mount.
	let leafletPromise: Promise<Leaflet> | null = null;

	function loadLeaflet(): Promise<Leaflet> {
		if (leafletPromise) return leafletPromise;

		leafletPromise = new Promise<Leaflet>((resolve, reject) => {
			if (!document.querySelector(`link[data-leaflet]`)) {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = LEAFLET_CSS;
				link.dataset.leaflet = '';
				document.head.appendChild(link);
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const existing = (window as any).L;
			if (existing) return resolve(existing);

			const script = document.createElement('script');
			script.src = LEAFLET_JS;
			script.async = true;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			script.onload = () => resolve((window as any).L);
			script.onerror = () => reject(new Error('Failed to load map library'));
			document.head.appendChild(script);
		});

		return leafletPromise;
	}

	// Free-form address → coordinates via OpenStreetMap's Nominatim. Best-effort:
	// returns null on any failure so the caller can show a fallback link.
	async function geocode(query: string): Promise<[number, number] | null> {
		try {
			const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
			const res = await fetch(url, { headers: { Accept: 'application/json' } });
			if (!res.ok) return null;
			const data = (await res.json()) as { lat: string; lon: string }[];
			if (!data.length) return null;
			return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
		} catch {
			return null;
		}
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	import { Button } from '$lib/components/ui/button';

	let {
		address,
		lat,
		lng
	}: {
		address: string;
		lat?: number;
		lng?: number;
	} = $props();

	let container: HTMLDivElement;
	let status = $state<'loading' | 'ready' | 'error'>('loading');

	const searchUrl = $derived(
		`https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`
	);

	onMount(() => {
		let cancelled = false;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let map: any;

		(async () => {
			try {
				const L = await loadLeaflet();
				const coords =
					typeof lat === 'number' && typeof lng === 'number' ? [lat, lng] : await geocode(address);

				if (cancelled) return;
				if (!coords) {
					status = 'error';
					return;
				}

				map = L.map(container, { scrollWheelZoom: false }).setView(coords, 15);
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 19,
					attribution: '© OpenStreetMap contributors'
				}).addTo(map);
				L.marker(coords).addTo(map).bindPopup(address);
				status = 'ready';
			} catch {
				if (!cancelled) status = 'error';
			}
		})();

		return () => {
			cancelled = true;
			if (map) map.remove();
		};
	});
</script>

<div class="relative h-40 w-full overflow-hidden rounded-md border">
	<div bind:this={container} class="h-full w-full" class:invisible={status !== 'ready'}></div>

	{#if status === 'loading'}
		<div class="text-muted-foreground absolute inset-0 flex items-center justify-center text-xs">
			Loading map…
		</div>
	{:else if status === 'error'}
		<!-- `searchUrl` is a genuinely external URL, so `Button`'s anchor is right here. -->
		<Button
			href={searchUrl}
			target="_blank"
			rel="noopener noreferrer"
			variant="ghost"
			class="text-muted-foreground hover:text-foreground absolute inset-0 h-full w-full rounded-none text-xs underline"
		>
			Open in map ↗
		</Button>
	{/if}
</div>
