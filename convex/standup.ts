import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const get = query({
	handler: async (ctx, args) => {
		return await ctx.db.query('standup').order('desc').take(6);
	},
});

export const getById = query({
	args: {
		id: v.id('standup'),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getByIdWithUsersAndUpdates = query({
	args: {
		id: v.id('standup'),
	},
	handler: async (ctx, args) => {
		const [standup, standupUsers, updates] = await Promise.all([
			ctx.db.get(args.id),
			ctx.db
				.query('standup_user')
				.withIndex('standupId', (q) => q.eq('standupId', args.id))
				.collect(),
			ctx.db
				.query('update')
				.withIndex('standupId', (q) => q.eq('standupId', args.id))
				.collect(),
		]);

		const sortedStandupUsers = standupUsers.toSorted(
			(a, b) => a.order - b.order,
		);

		const usersFull = await Promise.all(
			sortedStandupUsers.map(async (standupUser) => {
				const user = await ctx.db.get(standupUser.userId);
				return user;
			}),
		);

		return {
			...standup,
			users: usersFull.filter((user) => user !== null),
			updates,
		};
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		description: v.string(),
		emoji: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('standup', {
			name: args.name,
			description: args.description,
			emoji: args.emoji,
			startedAt: 0,
			finishedAt: 0,
		});
	},
});

export const start = mutation({
	args: {
		id: v.id('standup'),
		userId: v.id('user'),
	},
	handler: async (ctx, args) => {
		const [standup, update] = await Promise.all([
			ctx.db.get(args.id),
			ctx.db
				.query('update')
				.filter((q) =>
					q.and(
						q.eq(q.field('standupId'), args.id),
						q.eq(q.field('userId'), args.userId),
					),
				)
				.first(),
		]);
		if (standup === null) {
			throw new Error('Standup not found');
		}
		if (update === null) {
			throw new Error('Update already exists');
		}
		if (standup.startedAt !== 0) {
			throw new Error('Standup already started');
		}

		await Promise.all([
			ctx.db.patch(args.id, {
				startedAt: Date.now(),
				currentUser: args.userId,
			}),
			ctx.db.patch(update._id, {
				startedAt: Date.now(),
			}),
		]);
	},
});

export const next = mutation({
	args: {
		standupId: v.id('standup'),
		currentUser: v.id('user'),
		nextUser: v.id('user'),
	},
	handler: async (ctx, args) => {
		const currentUpdate = await ctx.db
			.query('update')
			.filter((q) =>
				q.and(
					q.eq(q.field('standupId'), args.standupId),
					q.eq(q.field('userId'), args.currentUser),
				),
			)
			.first();
		if (currentUpdate === null) {
			throw new Error('Update not found');
		}
		const nextUpdate = await ctx.db
			.query('update')
			.filter((q) =>
				q.and(
					q.eq(q.field('standupId'), args.standupId),
					q.eq(q.field('userId'), args.nextUser),
				),
			)
			.first();
		if (nextUpdate === null) {
			throw new Error('Next user not found');
		}
		await Promise.all([
			ctx.db.patch(currentUpdate._id, {
				finishedAt: Date.now(),
			}),
			ctx.db.patch(nextUpdate._id, {
				startedAt: Date.now(),
			}),
			ctx.db.patch(args.standupId, {
				currentUser: args.nextUser,
			}),
		]);
	},
});
export const finish = mutation({
	args: {
		id: v.id('standup'),
		currentUpdateId: v.id('update'),
	},
	handler: async (ctx, args) => {
		const standup = await ctx.db.get(args.id);
		const currentUpdate = await ctx.db.get(args.currentUpdateId);
		if (standup === null) {
			throw new Error('Standup not found');
		}
		if (standup.startedAt === 0) {
			throw new Error('Standup has not started yet');
		}
		if (standup.finishedAt !== 0) {
			throw new Error('Standup already finished');
		}
		if (currentUpdate === null) {
			throw new Error('Current update not found');
		}
		await Promise.all([
			ctx.db.patch(args.id, {
				finishedAt: Date.now(),
				currentUser: undefined,
			}),
			ctx.db.patch(currentUpdate._id, {
				finishedAt: Date.now(),
			}),
		]);
	},
});

export const getUserStats = query({
	args: {
		userId: v.id('user'),
	},
	handler: async (ctx, args) => {
		// Get all finished standups
		const allStandups = await ctx.db.query('standup').collect();
		const finishedStandups = allStandups.filter(
			(standup) => standup.finishedAt !== 0,
		);

		// Get all updates for this user
		const userUpdates = await ctx.db
			.query('update')
			.withIndex('userId', (q) => q.eq('userId', args.userId))
			.collect();

		// Get standups where user participated
		const userStandupParticipations = await ctx.db
			.query('standup_user')
			.withIndex('userId', (q) => q.eq('userId', args.userId))
			.collect();

		const userStandupIds = userStandupParticipations.map((p) => p.standupId);
		const userFinishedStandups = finishedStandups.filter((standup) =>
			userStandupIds.includes(standup._id),
		);

		// Calculate average standup duration
		const standupDurations = finishedStandups
			.filter((standup) => standup.startedAt > 0 && standup.finishedAt > 0)
			.map((standup) => standup.finishedAt - standup.startedAt);

		const avgStandupDuration =
			standupDurations.length > 0
				? standupDurations.reduce((sum, duration) => sum + duration, 0) /
					standupDurations.length
				: 0;

		// Calculate user's average update duration
		const userUpdateDurations = userUpdates
			.filter((update) => update.startedAt > 0 && update.finishedAt > 0)
			.map((update) => update.finishedAt - update.startedAt);

		const avgUserUpdateDuration =
			userUpdateDurations.length > 0
				? userUpdateDurations.reduce((sum, duration) => sum + duration, 0) /
					userUpdateDurations.length
				: 0;

		// Count completed standups for user
		const completedStandupsCount = userFinishedStandups.length;

		// Count total updates given by user
		const totalUpdatesCount = userUpdates.filter(
			(update) => update.startedAt > 0 && update.finishedAt > 0,
		).length;

		// Calculate participation rate (standups participated vs total standups)
		const participationRate =
			allStandups.length > 0
				? (userFinishedStandups.length / finishedStandups.length) * 100
				: 0;

		// Find fastest and slowest update times
		const fastestUpdate =
			userUpdateDurations.length > 0 ? Math.min(...userUpdateDurations) : 0;
		const slowestUpdate =
			userUpdateDurations.length > 0 ? Math.max(...userUpdateDurations) : 0;

		return {
			avgStandupDuration,
			avgUserUpdateDuration,
			completedStandupsCount,
			totalUpdatesCount,
			participationRate,
			fastestUpdate,
			slowestUpdate,
			totalStandupsCount: finishedStandups.length,
		};
	},
});

export const setIcebreaker = mutation({
	args: {
		standupId: v.id('standup'),
		icebreaker: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.standupId, {
			icebreaker: args.icebreaker,
		});
	},
});

export const deleteStandup = mutation({
	args: {
		id: v.id('standup'),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});
