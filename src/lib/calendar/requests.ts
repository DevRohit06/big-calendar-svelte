import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from './mocks';

// The mocks are randomly generated at module load, so these must only ever be
// called from a server `load` — importing them into a component would generate
// a different set of events on the server and the client.

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
