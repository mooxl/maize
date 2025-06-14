import type { Update } from '@/schemas/update';
import type { Id } from '../../convex/_generated/dataModel';

export const isUserReady = (updates: Update[], userId: string) => {
	const userUpdate = updates.find((update) => update.userId === userId);
	return (
		userUpdate &&
		userUpdate.ready === true &&
		userUpdate.startedAt === 0 &&
		userUpdate.finishedAt === 0
	);
};

export const isUserPreparing = (updates: Update[], userId: string) => {
	const userUpdate = updates.find((update) => update.userId === userId);
	return (
		userUpdate &&
		userUpdate.ready !== true &&
		userUpdate.startedAt === 0 &&
		userUpdate.finishedAt === 0
	);
};

export const isUserStarted = (
	currentUpdate: Update | undefined,
	currentUser: Id<'user'> | undefined,
	userId: string,
) => {
	return (
		currentUser === userId &&
		currentUpdate?.startedAt !== 0 &&
		currentUpdate?.finishedAt === 0
	);
};

export const isUserFinished = (updates: Update[], userId: string) => {
	const userUpdate = updates.find((update) => update.userId === userId);
	return (
		userUpdate && userUpdate.startedAt !== 0 && userUpdate.finishedAt !== 0
	);
};
