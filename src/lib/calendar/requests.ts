import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from './mocks';

// The mocks are randomly generated at module load. That used to force these to
// run only in a server `load`, because a server/client SSR mismatch would occur
// if the same module randomised differently on each side. Now that the browser
// owns the data — it seeds the store from localStorage (or these mocks) inside a
// client-only `$effect`, and there is no SSR of this data to disagree with — it
// is safe to call them from the client. The mocks are only a first-run fallback:
// once the user makes any change it is written to localStorage, and from then on
// the stored copy wins over these freshly-randomised mocks.

export const getEvents = async () => {
	// TO DO: implement this
	// Increase the delay to better see the loading state
	// await new Promise(resolve => setTimeout(resolve, 800));
	return CALENDAR_ITEMS_MOCK;
};

export const getUsers = async () => {
	// TO DO: implement this
	// Increase the delay to better see the loading state
	// await new Promise(resolve => setTimeout(resolve, 800));
	return USERS_MOCK;
};
