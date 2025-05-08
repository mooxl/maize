import type { ToOptions } from '@tanstack/router-core';
import { EqualApproximately, House } from 'lucide-react';

export const navigationMap: Record<
	Exclude<NonNullable<ToOptions['to']>, '.' | '..'>,
	{
		id: string;
		label: string;
		icon: React.ReactNode;
	}
> = {
	'/': {
		id: 'home',
		label: 'Home',
		icon: <House data-slot="icon" />,
	},
	'/about': {
		id: 'about',
		label: 'About',
		icon: <EqualApproximately data-slot="icon" />,
	},
	'/standups': {
		id: 'standups',
		label: 'Standups',
		icon: <EqualApproximately data-slot="icon" />,
	},
	'/standups/$standupId': {
		id: 'standup',
		label: 'Standup',
		icon: <EqualApproximately data-slot="icon" />,
	},
	'/standups/$standupId/update': {
		id: 'standup-update',
		label: 'Update',
		icon: <EqualApproximately data-slot="icon" />,
	},
};
