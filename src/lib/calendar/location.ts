import type { IEventLocation } from './interfaces';

export interface IMeetingMeta {
	/** Bare hostname, e.g. `zoom.us`. */
	host: string;
	/** Friendly platform name, e.g. `Zoom`, `Google Meet`. */
	label: string;
	/** Favicon for the platform, resolved from the URL's host. */
	faviconUrl: string;
}

// Known providers get a hand-written label; everything else falls back to the
// host's registrable name (`acme` from `call.acme.io`), so a self-hosted Jitsi
// or any other link still reads sensibly.
const PROVIDERS: { match: RegExp; label: string }[] = [
	{ match: /(^|\.)zoom\.us$/i, label: 'Zoom' },
	{ match: /(^|\.)meet\.google\.com$/i, label: 'Google Meet' },
	{ match: /(^|\.)teams\.(microsoft|live)\.com$/i, label: 'Microsoft Teams' },
	{ match: /(^|\.)meet\.jit\.si$/i, label: 'Jitsi Meet' },
	{ match: /(^|\.)webex\.com$/i, label: 'Webex' },
	{ match: /(^|\.)whereby\.com$/i, label: 'Whereby' },
	{ match: /(^|\.)meet\.jitsi$/i, label: 'Jitsi Meet' }
];

/**
 * Derives the platform name and favicon from a meeting URL. Returns `null` when
 * the string is not a parseable absolute URL, so callers can render a plain
 * fallback instead of a broken icon.
 */
export function getMeetingMeta(url: string): IMeetingMeta | null {
	let host: string;
	try {
		host = new URL(url).hostname.replace(/^www\./i, '');
	} catch {
		return null;
	}
	if (!host) return null;

	const known = PROVIDERS.find((p) => p.match.test(host))?.label;
	const registrable = host.split('.').slice(-2, -1)[0] ?? host;
	const label = known ?? registrable.charAt(0).toUpperCase() + registrable.slice(1);

	return {
		host,
		label,
		// DuckDuckGo's icon service returns a generic globe for unknown hosts, so
		// this never 404s into a broken image.
		faviconUrl: `https://icons.duckduckgo.com/ip3/${host}.ico`
	};
}

/**
 * Collapses the form's flat location shape down to the stored discriminated
 * union, keeping only the field the chosen `type` uses. Returns `undefined`
 * when that field is empty, so an untouched (or cleared) Location section saves
 * no location at all.
 */
export function toEventLocation(loc: {
	type: 'online' | 'physical';
	url: string;
	address: string;
}): IEventLocation | undefined {
	if (loc.type === 'online') {
		const url = loc.url.trim();
		return url ? { type: 'online', url } : undefined;
	}
	const address = loc.address.trim();
	return address ? { type: 'physical', address } : undefined;
}

/**
 * A short, single-line label for a location — used in dense views (agenda card,
 * badges) where the full address or a Join button would not fit.
 */
export function locationSummary(location: IEventLocation): string {
	if (location.type === 'online') {
		return getMeetingMeta(location.url)?.label ?? 'Online meeting';
	}
	// First segment of the address is usually the venue or street.
	return location.address.split(',')[0]?.trim() || location.address;
}
