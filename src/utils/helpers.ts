import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getInitials = (name: string) => {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase();
};

export const formatDuration = (milliseconds: number): string => {
	if (milliseconds === 0) {
		return '0s';
	}
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	if (hours > 0) {
		const remainingMinutes = minutes % 60;
		if (remainingMinutes > 0) {
			return `${hours}h ${remainingMinutes}m`;
		}
		return `${hours}h`;
	}
	if (minutes > 0) {
		const remainingSeconds = seconds % 60;
		if (remainingSeconds > 0) {
			return `${minutes}m ${remainingSeconds}s`;
		}
		return `${minutes} m`;
	}
	return `${seconds}s`;
};
