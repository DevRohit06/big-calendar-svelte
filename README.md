# Big Calendar — Svelte

A feature-rich calendar built with **SvelteKit**, **Svelte 5 runes**, **TypeScript**, and **Tailwind CSS v4** — five views, full event CRUD, drag-and-drop, per-user filtering, configurable working hours, and [**event locations**](#event-locations) with online-meeting links and an embedded map.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)
![SvelteKit 2](https://img.shields.io/badge/SvelteKit-2-FF3E00?logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)

![Month view](docs/screenshots/month-view.png)

Big Calendar bundles five views, full event CRUD, drag-and-drop scheduling, undo/redo, a command palette, and optional per-event locations into one SvelteKit app. Everything runs in the browser — events persist to `localStorage`, seeded from sample data on a first visit, with no backend to set up.

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
- 📍 **Event locations**
  - Attach an optional location to any event: an **online meeting** or a **physical address**
  - Online links show the platform's favicon and a one-click **Join** button — the platform (Zoom, Google Meet, Teams, Jitsi, …) is detected from the URL, so any link works
  - Physical addresses render on an embedded **map**, geocoded from the address string
  - See [Event locations](#event-locations)
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

## Screenshots

### The five views

|                                                |                                              |
| ---------------------------------------------- | -------------------------------------------- |
| **Month** — the busy-cell overflow grid        | **Week** — quarter-hour time slots           |
| ![Month view](docs/screenshots/month-view.png) | ![Week view](docs/screenshots/week-view.png) |
| **Day** — hourly breakdown                     | **Year** — twelve months at a glance         |
| ![Day view](docs/screenshots/day-view.png)     | ![Year view](docs/screenshots/year-view.png) |

**Agenda** — a chronological list grouped by day

![Agenda view](docs/screenshots/agenda-view.png)

### Locations

An event can carry an optional location. Online links resolve the platform from the URL and offer a one-click **Join**; physical addresses render on an embedded Leaflet map, geocoded from the address string.

|                                                                      |                                                                       |
| -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Online meeting** — favicon + Join                                  | **Physical address** — embedded map                                   |
| ![Online meeting details](docs/screenshots/event-details-online.png) | ![Physical location with map](docs/screenshots/event-details-map.png) |

### Creating, editing, and settings

|                                                             |                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| **Add event** — validated form                              | **Edit event** — location pre-expanded                       |
| ![Add event dialog](docs/screenshots/add-event-dialog.png)  | ![Edit event dialog](docs/screenshots/edit-event-dialog.png) |
| **Location picker** — online / in person                    | **Calendar settings** — badge style, visible & working hours |
| ![Location picker](docs/screenshots/add-event-location.png) | ![Calendar settings](docs/screenshots/settings-dialog.png)   |

### Command palette, shortcuts, and filtering

|                                                          |                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| **Command palette** (`⌘K` / `Ctrl+K`)                    | **Keyboard shortcuts** (`?`)                                   |
| ![Command palette](docs/screenshots/command-palette.png) | ![Keyboard shortcuts](docs/screenshots/keyboard-shortcuts.png) |

**Filter by user** — an avatar group in the picker, or pick one person

![User select](docs/screenshots/user-select.png)

### Dark mode

Every view supports a light and a dark theme, toggled from the header and remembered across reloads.

<details>
<summary>Show dark-theme views</summary>

|                                                            |                                                          |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| ![Month view (dark)](docs/screenshots/month-view-dark.png) | ![Week view (dark)](docs/screenshots/week-view-dark.png) |
| ![Day view (dark)](docs/screenshots/day-view-dark.png)     | ![Year view (dark)](docs/screenshots/year-view-dark.png) |

![Agenda view (dark)](docs/screenshots/agenda-view-dark.png)

</details>

## Tech stack

|                 | Choice                                  |
| --------------- | --------------------------------------- |
| Framework       | SvelteKit 2 / Svelte 5 (runes)          |
| Language        | TypeScript                              |
| Styling         | Tailwind CSS v4                         |
| UI components   | shadcn-svelte (bits-ui)                 |
| Forms           | sveltekit-superforms + formsnap + zod 4 |
| Date handling   | date-fns v4                             |
| Maps            | Leaflet + OpenStreetMap                 |
| Icons           | @lucide/svelte                          |
| State           | Svelte 5 runes + context                |
| Package manager | bun                                     |

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

## Usage

### 1. Provide the calendar state

Wrap your page or layout in `CalendarProvider`. It creates the shared state on context and, in a client-only effect, seeds events from `localStorage` (or `requests.ts` on a first visit):

```svelte
<!-- +layout.svelte -->
<script lang="ts">
	import CalendarProvider from '$lib/calendar/contexts/calendar-provider.svelte';
	let { children } = $props();
</script>

<CalendarProvider>
	{@render children()}
</CalendarProvider>
```

> Wiring the calendar into an existing app or a real backend? See the **[integration guide](docs/integration-guide.md)**.

### 2. Render a view

```svelte
<script lang="ts">
	import ClientContainer from '$lib/calendar/components/client-container.svelte';
</script>

<ClientContainer view="month" />
```

`view` accepts `"day" | "week" | "month" | "year" | "agenda"`.

### 3. Read and control state anywhere

The calendar exposes its state as a class instance from context:

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

`CalendarState` exposes the reactive fields `selectedDate`, `selectedUserId`, `badgeVariant`, `visibleHours`, `workingHours`, `users`, `events`, and `hydrated`, plus the methods `selectDate()`, `addEvent()`, `updateEvent()`, `deleteEvent()`, `undo()`, `redo()`, and `reset()`. See the [integration guide](docs/integration-guide.md) to route these through a backend.

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
	location?: IEventLocation; // optional — see "Event locations" below
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

## Event locations

Where an event happens matters as much as when — a Zoom link and a street address are not the same thing. Every event can carry an optional **location**, modeled as a discriminated union so an online meeting and a physical place never blur together:

- **Online** — a meeting link. The platform name and favicon are derived from the URL's host, so Zoom, Google Meet, Teams, Jitsi, Webex, Whereby, or a self-hosted link all work without a hard-coded provider list. The details dialog shows a one-click **Join** button.
- **Physical** — a free-text address (any country). The details dialog renders it on an embedded **Leaflet** map, geocoded on the fly from the address.

Design notes:

- **Optional and non-breaking.** Events without a location behave exactly as before; an empty location is stripped on submit, so nothing is stored until you actually fill it in.
- **The map never touches SSR.** Leaflet is loaded from a CDN inside `onMount`, so it never enters the server module graph — the same client-only pattern the calendar shell already uses for its shimmer library. No new npm dependency is added, and the server bundle contains zero map code.
- **Favicons come from a public icon service** keyed on the link's host, which falls back to a generic globe for unknown hosts, so the icon never renders broken.

> Locations are geocoded on display via OpenStreetMap's Nominatim (public endpoint, ~1 req/sec). A production deployment would want a dedicated geocoding key and to persist the resulting `lat`/`lng` — the `IEventLocation` type already carries the optional fields for it.

## Roadmap

- [ ] Persist badge variant and working hours across reloads.
- [ ] Persist geocoded `lat`/`lng` and swap Nominatim for a keyed geocoding service.
- [ ] Component tests (vitest + vitest-browser-svelte are already configured).

## Contributing

Contributions are welcome — issues and pull requests both. Please run `bun run check` and `bun run lint` before submitting.

## Credits

A Svelte reimagining of an idea by [Leonardo Ramos](https://github.com/lramos33) — MIT.

Built with [SvelteKit](https://svelte.dev/docs/kit), [shadcn-svelte](https://shadcn-svelte.com), [bits-ui](https://bits-ui.com), [date-fns](https://date-fns.org), and [Tailwind CSS](https://tailwindcss.com).

## License

[MIT](LICENSE). © 2026 Rohit Kushwaha, with © 2025 Leonardo Ramos for the earlier work this builds on — both notices are retained in the LICENSE file, as MIT requires.
