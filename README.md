# Big Calendar — Svelte

A feature-rich calendar built with **SvelteKit**, **Svelte 5 runes**, **TypeScript**, and **Tailwind CSS v4**. Five views, event editing, per-user filtering, and configurable working hours.

This is a port of [**lramos33/big-calendar**](https://github.com/lramos33/big-calendar) — Leonardo Ramos's excellent Next.js + React calendar — rebuilt for Svelte. See [Credits](#credits).

> **Status:** Views, header, settings, and event dialogs are complete and working. **Drag and drop is not implemented yet** — see [Roadmap](#roadmap).

## Features

- 📅 **Five calendar views**
  - Agenda, Year, Month, Week (detailed time slots), Day (hourly breakdown)
- 🎨 **Event customization**
  - Seven event colors
  - Three badge variants (dot, colored, mixed)
  - Single- and multi-day events, with multi-day events spanning cells
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
  - Dark mode support

## Tech stack

|                 | This port                               | Original (React)        |
| --------------- | --------------------------------------- | ----------------------- |
| Framework       | SvelteKit 2 / Svelte 5 (runes)          | Next.js 14 / React 18   |
| Language        | TypeScript                              | TypeScript              |
| Styling         | Tailwind CSS v4                         | Tailwind CSS v3         |
| UI components   | shadcn-svelte (bits-ui)                 | shadcn/ui (Radix)       |
| Forms           | sveltekit-superforms + formsnap + zod 4 | react-hook-form + zod 3 |
| Date handling   | date-fns v4                             | date-fns v3             |
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
│   ├── +layout.server.ts             # Loads users + events (server-only)
│   ├── +layout.svelte                # CalendarProvider + settings accordion
│   ├── layout.css                    # Tailwind v4 theme, custom utilities
│   └── {day,week,month,year,agenda}-view/
├── lib/
│   ├── calendar/
│   │   ├── components/
│   │   │   ├── agenda-view/
│   │   │   ├── dialogs/              # Add / edit / details dialogs
│   │   │   ├── dnd/                  # Drag and drop (stubs, see Roadmap)
│   │   │   ├── header/
│   │   │   ├── month-view/
│   │   │   ├── week-and-day-view/
│   │   │   └── year-view/
│   │   ├── contexts/                 # CalendarState class ($state runes)
│   │   ├── helpers.ts                # Pure date/layout math
│   │   ├── interfaces.ts
│   │   ├── schemas.ts                # zod event schema
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
}

interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
}
```

> **Note:** `src/lib/calendar/mocks.ts` generates its events with `Math.random()` at module load, so only import it from a server `load`. Pulling it into a component would generate different events on the server and the client, and hydration would tear.

### Creating events

`AddEventDialog` validates but does not persist — its `onUpdate` handler is a deliberate no-op, as in the original. Wire it to your backend there.

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

- [ ] **Drag and drop.** The components in `src/lib/calendar/components/dnd/` are typed pass-through stubs. The plan is `@neodrag/svelte` for dragging plus hand-rolled pointer hit-testing for the day-cell and quarter-hour drop targets, since neodrag has no drop-target concept.
- [ ] Persist badge variant and working hours across reloads.
- [ ] Component tests (vitest + vitest-browser-svelte are already configured).

## Credits

This project is a Svelte port of [**big-calendar**](https://github.com/lramos33/big-calendar) by **[Leonardo Ramos](https://github.com/lramos33)** ([@leoo_ramos1](https://x.com/leoo_ramos1)). The layout algorithms, view structure, event model, and visual design are his work — this port translates them to Svelte 5 rather than reinventing them. If you find this useful, please star [the original repository](https://github.com/lramos33/big-calendar) and consider [buying him a coffee](https://www.buymeacoffee.com/lramos33).

Built with [SvelteKit](https://svelte.dev/docs/kit), [shadcn-svelte](https://shadcn-svelte.com), [bits-ui](https://bits-ui.com), [date-fns](https://date-fns.org), and [Tailwind CSS](https://tailwindcss.com).

## License

[MIT](LICENSE). The original work is MIT © 2025 Leonardo Ramos; this port is MIT © 2026 Rohit Kushwaha. Both copyright notices are retained in the LICENSE file, as MIT requires.

## Contributing

Contributions are welcome — issues and pull requests both. Please run `bun run check` and `bun run lint` before submitting.
