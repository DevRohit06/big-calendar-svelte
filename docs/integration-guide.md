# Integration guide

How to drop Big Calendar into an existing SvelteKit app, and how to connect it to a real backend instead of the built-in `localStorage` store.

- [1. Add the calendar to an existing project](#1-add-the-calendar-to-an-existing-project)
- [2. How the data flows](#2-how-the-data-flows)
- [3. Connect a backend](#3-connect-a-backend)
  - [The read path — loading events and users](#the-read-path--loading-events-and-users)
  - [The write path — persisting mutations](#the-write-path--persisting-mutations)
  - [Server-side rendering with a `load` function](#server-side-rendering-with-a-load-function)
  - [Authentication](#authentication)
- [4. Data contract](#4-data-contract)
- [5. Checklist and gotchas](#5-checklist-and-gotchas)

---

## 1. Add the calendar to an existing project

### Prerequisites

The calendar is built for **Svelte 5** (runes) and **Tailwind CSS v4**. Your host app needs:

- SvelteKit 2 / Svelte 5
- Tailwind CSS v4 (the calendar uses custom utilities defined in `src/routes/layout.css` — copy the `@utility` blocks and theme tokens over)
- The runtime dependencies it imports: `date-fns`, `mode-watcher`, `bits-ui`, `@lucide/svelte`, `sveltekit-superforms` + `formsnap` + `zod`, `tailwind-variants`, `svelte-sonner`, and `@atlaskit/pragmatic-drag-and-drop`

Install them with your package manager, e.g.:

```bash
bun add date-fns mode-watcher bits-ui @lucide/svelte sveltekit-superforms formsnap zod \
  tailwind-variants svelte-sonner @atlaskit/pragmatic-drag-and-drop
```

### Copy the source

Copy two directories into your app's `$lib`:

- `src/lib/calendar/` — the calendar itself (state, components, helpers, storage)
- `src/lib/components/ui/` — the shadcn-svelte primitives it depends on (button, dialog, select, calendar, popover, sonner, and the custom `time-input` / `single-day-picker`)

Also copy the theme tokens and custom utilities from `src/routes/layout.css` into your global stylesheet — the non-working-hour hatching (`@utility`) and the `--spacing`-derived sizes (`w-18`, `h-6.5`) live there.

### Mount the provider

`CalendarProvider` creates the calendar state and puts it on Svelte context. Everything that reads the calendar — the views, the command palette, keyboard shortcuts — must render **inside** it. Put it in a layout:

```svelte
<!-- src/routes/(calendar)/+layout.svelte -->
<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import CalendarProvider from '$lib/calendar/contexts/calendar-provider.svelte';
	import KeyboardShortcuts from '$lib/calendar/components/keyboard-shortcuts.svelte';
	import CommandPalette from '$lib/calendar/components/command-palette.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />

<CalendarProvider>
	<KeyboardShortcuts />
	<CommandPalette />
	{@render children()}
</CalendarProvider>
```

> `ModeWatcher` drives the light/dark theme and `Toaster` renders the undo toasts — both are optional, but the theme toggle and undo notifications need them.

### Render a view

Each view is a thin page that renders `ClientContainer` with a `view` prop:

```svelte
<!-- src/routes/(calendar)/month-view/+page.svelte -->
<script lang="ts">
	import ClientContainer from '$lib/calendar/components/client-container.svelte';
</script>

<ClientContainer view="month" />
```

`view` accepts `"day" | "week" | "month" | "year" | "agenda"`. `ClientContainer` renders the header, the current-time indicator, the loading skeleton, and the grid for that view.

### Read and control state anywhere

Inside the provider, call `getCalendarState()` to reach the shared `CalendarState` instance:

```svelte
<script lang="ts">
	import { getCalendarState } from '$lib/calendar/contexts/calendar-context.svelte';

	const calendar = getCalendarState();

	// Read properties off `calendar` directly — destructuring loses reactivity.
	function jumpToToday() {
		calendar.selectDate(new Date());
	}
</script>

<button onclick={jumpToToday}>Today</button>
<p>Showing {calendar.selectedDate.toDateString()} ({calendar.events.length} events)</p>
```

`CalendarState` exposes the reactive fields `selectedDate`, `selectedUserId`, `badgeVariant`, `visibleHours`, `workingHours`, `users`, `events`, and `hydrated`, plus the methods `selectDate()`, `addEvent()`, `updateEvent()`, `deleteEvent()`, `undo()`, `redo()`, and `reset()`.

---

## 2. How the data flows

Out of the box the **browser owns the data**. There is no backend; events live in `localStorage`, seeded from randomised mocks on a first visit.

```
                    ┌─────────────────────────────────────────────┐
   read (once)      │              CalendarProvider               │
 ┌───────────────►  │  $effect (client-only):                     │
 │  requests.ts     │    users  = await getUsers()                │
 │   getUsers()     │    events = loadEvents() ?? await getEvents()│
 │   getEvents()    │    calendar.hydrate(events)                 │
 └───────────────►  └───────────────────────┬─────────────────────┘
                                             │
                                     ┌───────▼────────┐
                                     │  CalendarState │  ← getCalendarState()
                                     │  (runes store) │
                                     └───────┬────────┘
                     mutate (add/update/delete/undo/redo)
                                             │
                                     ┌───────▼────────┐
   write (every change)              │   #mutate()    │
                                     │  record history│
                                     │  saveEvents()  ├──► storage.ts → localStorage
                                     └────────────────┘
```

There are exactly **two seams** where a backend plugs in:

| Seam      | File                                                                    | Responsibility                                       |
| --------- | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| **Read**  | `src/lib/calendar/requests.ts`                                          | `getEvents()` / `getUsers()` — the initial load      |
| **Write** | `src/lib/calendar/contexts/calendar-context.svelte.ts` (+ `storage.ts`) | `addEvent` / `updateEvent` / `deleteEvent` — persist |

Every mutation in the app — dialog edits, drag, resize, drag-to-create, delete, undo, redo — routes through `addEvent`/`updateEvent`/`deleteEvent` and then the private `#mutate()`, so you only have to intercept those three methods to persist everything.

---

## 3. Connect a backend

### The read path — loading events and users

`requests.ts` is the intended seam. It ships returning the mocks with a `// TO DO: implement this` marker. Replace the bodies with real fetches that return the same shapes (`IEvent[]` and `IUser[]`):

```ts
// src/lib/calendar/requests.ts
import type { IEvent, IUser } from './interfaces';

export const getEvents = async (): Promise<IEvent[]> => {
	const res = await fetch('/api/events');
	if (!res.ok) throw new Error(`Failed to load events: ${res.status}`);
	return res.json();
};

export const getUsers = async (): Promise<IUser[]> => {
	const res = await fetch('/api/users');
	if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);
	return res.json();
};
```

Your API must return events whose `startDate`/`endDate` are **ISO 8601 strings** and whose `user` is embedded (see [Data contract](#4-data-contract)).

> **Turning off `localStorage`.** The provider still prefers a stored copy over the fetch (`loadEvents() ?? await getEvents()`), which is what makes local edits survive a reload in the demo. Once your backend is the source of truth you'll usually want the fetch to win. Edit `src/lib/calendar/contexts/calendar-provider.svelte` so it always hydrates from the request:
>
> ```svelte
> // was: calendar.hydrate(loadEvents() ?? mocks); calendar.hydrate(mocks); // mocks === await
> getEvents(), now your API
> ```
>
> …and drop the `saveEvents(mocks)` seed line. Keep `localStorage` only if you want an offline cache.

### The write path — persisting mutations

The three mutation methods live in `calendar-context.svelte.ts`. Each currently calls the private `#mutate()`, which records an undo snapshot and calls `saveEvents()` (localStorage). To persist to a backend, wrap each method so it updates the UI **optimistically** (keeping undo/redo instant) and syncs in the background.

A minimal, self-contained approach — edit the methods to fire the network call after the optimistic update:

```ts
// src/lib/calendar/contexts/calendar-context.svelte.ts

addEvent(event: Omit<IEvent, 'id'>) {
	// Optimistic: assign a temporary id so the UI updates immediately.
	const tempId = Math.max(...this.events.map((e) => e.id), 0) + 1;
	this.#mutate([...this.events, { ...event, id: tempId }]);

	// Reconcile with the server-assigned id.
	fetch('/api/events', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(event)
	})
		.then((r) => r.json())
		.then((saved: IEvent) => {
			this.events = this.events.map((e) => (e.id === tempId ? saved : e));
		})
		.catch(() => {
			// Roll back on failure.
			this.events = this.events.filter((e) => e.id !== tempId);
			// surface a toast here if you like
		});
}

updateEvent(event: IEvent) {
	const index = this.events.findIndex((e) => e.id === event.id);
	if (index === -1) return;

	const next = [...this.events];
	next[index] = event;
	this.#mutate(next);

	fetch(`/api/events/${event.id}`, {
		method: 'PATCH',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(event)
	}).catch(() => {
		/* reload or roll back */
	});
}

deleteEvent(id: IEvent['id']) {
	this.#mutate(this.events.filter((e) => e.id !== id));

	fetch(`/api/events/${id}`, { method: 'DELETE' }).catch(() => {
		/* reload or roll back */
	});
}
```

Notes:

- **Keep `#mutate()`** in the optimistic step — it's what preserves undo/redo across every interaction. If you skip it, drag, resize, and dialog edits stop being undoable.
- **The demo assigns ids client-side** (`max(id) + 1`). With a real backend, let the server own the id and reconcile the temporary one from the POST response, as above.
- **`updateEvent` normalises dates** to ISO strings in the original; keep that if your callers might pass `Date` objects.
- **Prefer per-entity REST calls** over re-writing the whole collection. If you'd rather keep a single seam, you can instead make `saveEvents()` in `storage.ts` PUT the entire `events` array to one endpoint — simpler, but chattier and racier.

### Server-side rendering with a `load` function

The default provider fetches on the client (inside a `$effect`), so nothing is server-rendered — you get the loading skeleton first. If you'd rather load on the server (for SSR, caching, or auth via cookies), add a `load` and pass the data into the provider as props.

1. Add a layout `load`:

   ```ts
   // src/routes/(calendar)/+layout.server.ts
   import type { LayoutServerLoad } from './$types';

   export const load: LayoutServerLoad = async ({ fetch, locals }) => {
   	const [events, users] = await Promise.all([
   		fetch('/api/events').then((r) => r.json()),
   		fetch('/api/users').then((r) => r.json())
   	]);
   	return { events, users };
   };
   ```

2. Give the provider optional props and seed from them instead of the client fetch. In `calendar-provider.svelte`:

   ```svelte
   <script lang="ts">
   	let { children, users = [], events = [] } = $props();
   	const calendar = setCalendarState(users);

   	$effect(() => {
   		calendar.users = users;
   		calendar.hydrate(events); // no request, no localStorage
   	});
   </script>
   ```

3. Pass the loaded data through the layout:

   ```svelte
   <!-- +layout.svelte -->
   <script lang="ts">
   	let { data, children } = $props();
   </script>

   <CalendarProvider users={data.users} events={data.events}>
   	{@render children()}
   </CalendarProvider>
   ```

The write path is unchanged — mutations still go through `addEvent`/`updateEvent`/`deleteEvent`.

### Authentication

- **Client fetches** (`requests.ts`, the mutation methods): attach your token in the `headers`, or rely on same-origin cookies if your API is on the same host.
- **Server `load`**: read the session from `locals`/cookies and forward it, using the event's `fetch` so cookies are passed through automatically.
- Scope events to the signed-in user server-side; the `selectedUserId` filter in the UI is a view convenience, not an authorization boundary.

---

## 4. Data contract

Your backend must produce and accept these shapes (from `src/lib/calendar/interfaces.ts`):

```ts
interface IEvent {
	id: number;
	title: string;
	description: string;
	startDate: string; // ISO 8601, e.g. "2026-07-12T15:00:00.000Z"
	endDate: string; // ISO 8601
	color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray';
	user: IUser; // embedded, not just a foreign key
	location?: IEventLocation; // optional
}

interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
}

type IEventLocation =
	| { type: 'online'; url: string }
	| { type: 'physical'; address: string; lat?: number; lng?: number };
```

A minimal REST surface that maps onto the two seams:

| Method   | Path              | Maps to         | Body / result                  |
| -------- | ----------------- | --------------- | ------------------------------ |
| `GET`    | `/api/events`     | `getEvents()`   | → `IEvent[]`                   |
| `GET`    | `/api/users`      | `getUsers()`    | → `IUser[]`                    |
| `POST`   | `/api/events`     | `addEvent()`    | `Omit<IEvent,'id'>` → `IEvent` |
| `PATCH`  | `/api/events/:id` | `updateEvent()` | `IEvent` → `IEvent`            |
| `DELETE` | `/api/events/:id` | `deleteEvent()` | → `204`                        |

Contract details:

- **Dates are ISO strings, not `Date` objects** — the calendar parses them with `date-fns` `parseISO`. Store them as UTC and convert at the edges.
- **`user` is embedded** in each event so the views can render the avatar and filter without a second lookup. If your API returns a `userId`, join it before returning.
- **`location` is a discriminated union** on `type`; omit the whole field when there's no location (an empty location is stripped on submit).
- **`lat`/`lng` are optional.** When absent, the details map geocodes the `address` on display via Nominatim. Persist them once geocoded to avoid re-geocoding (see the [roadmap](../README.md#roadmap)).

---

## 5. Checklist and gotchas

- [ ] **Provider wraps everything.** `getCalendarState()` throws outside a `<CalendarProvider>`.
- [ ] **Keep mutations flowing through the three methods.** Undo/redo and the toasts depend on `#mutate()` running for every change.
- [ ] **Return ISO date strings** from your API; don't send raw `Date`s.
- [ ] **Embed `user`** in each event.
- [ ] **Let the server assign ids** and reconcile the optimistic temp id from the response.
- [ ] **Decide what wins on load** — the backend fetch or the `localStorage` cache. For a real backend, prefer the fetch (see the read-path note) or remove the storage layer entirely.
- [ ] **`mocks.ts` uses `Math.random()` at module load.** It's safe to import on the client (the store is client-hydrated), but if you move loading into a server `load`, don't also import the mocks into a component — a server/client mismatch would tear hydration.
- [ ] **`localStorage` is versioned** (`storage.ts`, `VERSION = 1`). If you change the `IEvent` shape and keep the cache, bump the version so stale entries are discarded rather than mis-parsed.
- [ ] **No data is SSR'd by default.** The first paint is the skeleton until the client `$effect` resolves; switch to the [`load` approach](#server-side-rendering-with-a-load-function) if you need server-rendered events.
