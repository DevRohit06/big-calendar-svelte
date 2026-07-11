import type { TEventColor } from './types';

export interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
}

// A location is either an online meeting (a join link, from which we derive the
// platform's name and favicon) or a physical place (a free-text address, any
// country — not the React version's US street/city/state/ZIP). `lat`/`lng` are
// optional and meant to be filled by a geocoder; the map falls back to
// geocoding the address string when they are absent.
export interface IOnlineLocation {
	type: 'online';
	url: string;
}

export interface IPhysicalLocation {
	type: 'physical';
	address: string;
	lat?: number;
	lng?: number;
}

export type IEventLocation = IOnlineLocation | IPhysicalLocation;

export interface IEvent {
	id: number;
	startDate: string;
	endDate: string;
	title: string;
	color: TEventColor;
	description: string;
	user: IUser;
	// Optional and non-breaking: events without a location behave exactly as before.
	location?: IEventLocation;
}

export interface ICalendarCell {
	day: number;
	currentMonth: boolean;
	date: Date;
}
