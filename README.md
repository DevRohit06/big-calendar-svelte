# Big Calendar — Svelte

A feature-rich calendar built with **SvelteKit**, **Svelte 5 runes**, **TypeScript**, and **Tailwind CSS v4**. Five views, event editing, per-user filtering, configurable working hours — and **event locations** with online-meeting links and an embedded map.

This began as a port of [**lramos33/big-calendar**](https://github.com/lramos33/big-calendar) — Leonardo Ramos's excellent Next.js + React calendar — rebuilt for Svelte 5. It is not a line-for-line copy: it fixes bugs from the original and adds features that aren't there, most notably [**event locations**](#beyond-the-original). See [Credits](#credits).

> **Status:** Views, header, settings, drag and drop, and full event CRUD are complete and working. Events live in your browser's `localStorage`, seeded from mock data on a first visit — there is no backend.

## Features

- 📅 **Five calendar views**
  - Agenda, Year, Month, Week (detailed time slots), Day (hourly breakdown)
- ✏️ **Create, edit, and delete events**
  - Drag across empty grid slots in the week or day view to block out a new event
  - Your events are saved in this browser (`localStorage`), and survive a reload
  - "Reset to sample data" in settings puts the demo back the way it started
- ↩️ **Undo and redo**
  - `⌘Z` / `Ctrl+Z` undoes, `⇧⌘Z` / `Ctrl+Y` redoes — every create, edit, move, resize, and delete
  - Each change raises a toast with an Undo button
- ⌨️ **Command palette and keyboard shortcuts**
  - `⌘K` / `Ctrl+K` to switch views, jump to today, create an event, or search events by title
  - `t` today, `n` new event, `g` then `d`/`w`/`m`/`y`/`a` to switch view, `←`/`→` to page, `?` for the full list
- 📍 **Event locations** _(new — not in the original)_
  - Attach an optional location to any event: an **online meeting** or a **physical address**
  - Online links show the platform's favicon and a one-click **Join** button — the platform (Zoom, Google Meet, Teams, Jitsi, …) is detected from the URL, so any link works
  - Physical addresses render on an embedded **map**, geocoded from the address string
  - See [Beyond the original](#beyond-the-original)
- 🎨 **Event customization**
  - Seven event colors
  - Three badge variants (dot, colored, mixed)
  - Single- and multi-day events, with multi-day events spanning cells
  - Busy month cells reveal their hidden events in a popover
- 🖱️ **Drag and drop**
  - Drag events onto another day in the month view, or onto any quarter-hour slot in the week and day views
  - Drag across empty slots to create an event over exactly that range; `Esc` abandons the drag
  - Resize events by their top or bottom edge to change start or end time, with keyboard support
- 👥 **User management**
  - Filter events by user, or view everyone at once
  - Avatar group in the user picker
- ⚡ **Real-time**
  - Live current-time indicator on the week and day grids
  - "Happening now" panel in the day view
- ⏰ **Time customization**
  - Per-weekday working hours, with non-working hours hatched
  - Adjustable visible-hours range that auto-expands to fit outlying events
- 🎯 **UI/UX**
  - Responsive, accessible, keyboard-navigable
  - Light and dark themes, toggled from the header and remembered across reloads
  - Loading skeletons until events hydrate, and empty states that offer a Create button

## Tech stack

|                 | This port                               | Original (React)        |
| --------------- | --------------------------------------- | ----------------------- |
| Framework       | SvelteKit 2 / Svelte 5 (runes)          | Next.js 14 / React 18   |
| Language        | TypeScript                              | TypeScript              |
| Styling         | Tailwind CSS v4                         | Tailwind CSS v3         |
| UI components   | shadcn-svelte (bits-ui)                 | shadcn/ui (Radix)       |
| Forms           | sveltekit-superforms + formsnap + zod 4 | react-hook-form + zod 3 |
| Date handling   | date-fns v4                             | date-fns v3             |
| Maps            | Leaflet + OpenStreetMap _(this port)_   | —                       |
| Icons           | @lucide/svelte                          | lucide-react            |
| State           | Svelte 5 runes + context                | React Context           |
| Package manager | bun                                     | npm                     |

## Getting started

```bash
git clone https://github.com/DevRohit06/big-calendar-svelte.git
cd big-calendar-svelte
bun install
bun run dev
```

Open <http://localhost:5173>. The root route redirects to `/month-view`.

Other scripts:

```bash
bun run check     # svelte-check + tsc
bun run lint      # prettier --check && eslint
bun run format    # prettier --write
bun run build     # production build
```

## Project structure

```
src/
├── routes/
│   ├── +layout.svelte                # ModeWatcher + CalendarProvider
│   ├── layout.css                    # Tailwind v4 theme, custom utilities
│   └── {day,week,month,year,agenda}-view/
├── lib/
│   ├── calendar/
│   │   ├── components/
│   │   │   ├── agenda-view/
│   │   │   ├── dialogs/              # Add / edit / details dialogs
│   │   │   ├── dnd/                  # Drag, resize, drag-to-create
│   │   │   ├── header/
│   │   │   ├── month-view/
│   │   │   ├── week-and-day-view/
│   │   │   ├── year-view/
│   │   │   ├── command-palette.svelte
│   │   │   └── keyboard-shortcuts.svelte
│   │   ├── contexts/                 # CalendarState class ($state runes)
│   │   ├── helpers.ts                # Pure date/layout math
│   │   ├── history.ts                # Snapshot undo/redo stacks
│   │   ├── interfaces.ts
│   │   ├── notifications.ts          # Undoable toasts
│   │   ├── schemas.ts                # zod event schema
│   │   ├── storage.ts                # Versioned localStorage codec
│   │   └── types.ts
│   ├── components/ui/                # shadcn-svelte + two custom components
│   └── hooks/
```

## Usage

### 1. Provide the calendar state

Wrap your page or layout in `CalendarProvider`, loading data from a server `load`:

```svelte
<!-- +layout.svelte -->
<script lang="ts">
	import CalendarProvider from '$lib/calendar/contexts/calendar-provider.svelte';
	let { data, children } = $props();
</script>

<CalendarProvider users={data.users} events={data.events}>
	{@render children()}
</CalendarProvider>
```

### 2. Render a view

```svelte
<script lang="ts">
	import ClientContainer from '$lib/calendar/components/client-container.svelte';
</script>

<ClientContainer view="month" />
```

`view` accepts `"day" | "week" | "month" | "year" | "agenda"`.

### 3. Read and control state anywhere

Where the React version exposes a `useCalendar()` hook, this port exposes a class instance from context:

```svelte
<script lang="ts">
	import { getCalendarState } from '$lib/calendar/contexts/calendar-context.svelte';

	const calendar = getCalendarState();

	// Read properties off `calendar` directly — destructuring loses reactivity.
	function jumpToToday() {
		calendar.selectDate(new Date());
	}
</script>

<p>Showing {calendar.selectedDate.toDateString()}</p>
```

`CalendarState` exposes `selectedDate`, `selectedUserId`, `badgeVariant`, `visibleHours`, `workingHours`, `users`, and `events`, plus the `selectDate()` and `updateEvent()` methods.

### Data structures

```ts
interface IEvent {
	id: number;
	title: string;
	description: string;
	startDate: string; // ISO string
	endDate: string; // ISO string
	color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray';
	user: IUser;
	location?: IEventLocation; // optional — see "Beyond the original"
}

interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
}

// A location is either an online meeting or a physical place — never a mix of
// both, so it is modeled as a discriminated union.
type IEventLocation =
	| { type: 'online'; url: string }
	| { type: 'physical'; address: string; lat?: number; lng?: number };
```

> **Note:** `src/lib/calendar/mocks.ts` generates its events with `Math.random()` at module load, so only import it from a server `load`. Pulling it into a component would generate different events on the server and the client, and hydration would tear.

### Creating events

`AddEventDialog` validates with zod and, on submit, calls `calendar.addEvent()`, which appends the event, records an undo snapshot, and writes through to `localStorage`. To persist to a backend instead, swap the body of `addEvent`/`updateEvent`/`deleteEvent` on `CalendarState` — every mutation already routes through them.

## Beyond the original

The React app models an event as a time, a title, a color, and a user. But _where_ an event happens matters as much as _when_ — a Zoom link and a street address are not the same thing. This port adds an optional **location** to every event, modeled as a discriminated union rather than the flat US-address form a first pass might reach for:

- **Online** — a meeting link. The platform name and favicon are derived from the URL's host, so Zoom, Google Meet, Teams, Jitsi, Webex, Whereby, or a self-hosted link all work without a hard-coded provider list. The details dialog shows a one-click **Join** button.
- **Physical** — a free-text address (any country — not a US street/city/state/ZIP form). The details dialog renders it on an embedded **Leaflet** map, geocoded on the fly from the address.

Design notes:

- **Optional and non-breaking.** Events without a location behave exactly as before; an empty location is stripped on submit, so nothing is stored until you actually fill it in.
- **The map never touches SSR.** Leaflet is loaded from a CDN inside `onMount`, so it never enters the server module graph — the same client-only pattern the calendar shell already uses for its shimmer library. No new npm dependency is added, and the server bundle contains zero map code.
- **Favicons come from a public icon service** keyed on the link's host, which falls back to a generic globe for unknown hosts, so the icon never renders broken.

> Locations are geocoded on display via OpenStreetMap's Nominatim (public endpoint, ~1 req/sec). A production deployment would want a dedicated geocoding key and to persist the resulting `lat`/`lng` — the `IEventLocation` type already carries the optional fields for it.

## Notable porting decisions

- **`cva` → `tailwind-variants`.** The `tv()` API maps almost line-for-line onto `cva()`, and it is what shadcn-svelte itself uses.
- **Radix `asChild` → bits-ui `child` snippets.** Trigger props are handed to the caller, which spreads them onto its own element.
- **`useMemo` → `$derived`,** and the `useCalendar()` hook became a `CalendarState` class with `$state` fields.
- **`react-day-picker` → bits-ui Calendar,** which speaks `@internationalized/date`, so `Date`s are converted through `CalendarDate`.
- **`react-aria` `TimeField` → bits-ui `TimeField`,** wrapped in a custom `time-input` component.
- **Tailwind v4 has no `backgroundImage` theme key,** so the non-working-hour hatching became an `@utility` in `layout.css`. The custom spacing scale (`w-18`, `h-6.5`) needed no config at all — v4 derives those from `--spacing`.
- **Forms use `dataType: 'json'`,** because `startTime`/`endTime` are nested `{ hour, minute }` objects that superforms cannot flatten into form data.

Two bugs in the original were fixed along the way: `getEventBlockStyle` mutated the `Date` passed into it (via `setHours`), and the year view's overflow branch omitted `gray` from its dot-color list, rendering gray dots invisible.

## Roadmap

- [ ] Persist badge variant and working hours across reloads.
- [ ] Persist geocoded `lat`/`lng` and swap Nominatim for a keyed geocoding service.
- [ ] Component tests (vitest + vitest-browser-svelte are already configured).

## Credits

This project is a Svelte port of [**big-calendar**](https://github.com/lramos33/big-calendar) by **[Leonardo Ramos](https://github.com/lramos33)** ([@leoo_ramos1](https://x.com/leoo_ramos1)). The layout algorithms, view structure, event model, and visual design are his work — this port translates them to Svelte 5 rather than reinventing them. If you find this useful, please star [the original repository](https://github.com/lramos33/big-calendar).

Built with [SvelteKit](https://svelte.dev/docs/kit), [shadcn-svelte](https://shadcn-svelte.com), [bits-ui](https://bits-ui.com), [date-fns](https://date-fns.org), and [Tailwind CSS](https://tailwindcss.com).

## License

[MIT](LICENSE). The original work is MIT © 2025 Leonardo Ramos; this port is MIT © 2026 Rohit Kushwaha. Both copyright notices are retained in the LICENSE file, as MIT requires.

## Contributing

Contributions are welcome — issues and pull requests both. Please run `bun run check` and `bun run lint` before submitting.
