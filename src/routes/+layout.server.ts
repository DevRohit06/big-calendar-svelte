import { getEvents, getUsers } from '$lib/calendar/requests';

import type { LayoutServerLoad } from './$types';

// Server-only: the mocks randomise at module load, so they must never be
// evaluated in the browser or SSR and hydration would disagree.
export const load: LayoutServerLoad = async () => {
	const [events, users] = await Promise.all([getEvents(), getUsers()]);
	return { events, users };
};
