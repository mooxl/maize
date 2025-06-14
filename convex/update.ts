import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getByUserIdAndStandupId = query({
	args: {
		userId: v.id('user'),
		standupId: v.id('standup'),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('update')
			.filter((q) =>
				q.and(
					q.eq(q.field('userId'), args.userId),
					q.eq(q.field('standupId'), args.standupId),
				),
			)
			.first();
	},
});

export const create = mutation({
	args: {
		userId: v.id('user'),
		standupId: v.id('standup'),
		content: v.object({
			yesterday: v.string(),
			today: v.string(),
		}),
		ready: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('update', {
			userId: args.userId,
			standupId: args.standupId,
			content: args.content,
			startedAt: 0,
			finishedAt: 0,
			ready: args.ready ?? false,
		});
	},
});

export const update = mutation({
	args: {
		id: v.id('update'),
		content: v.object({
			yesterday: v.string(),
			today: v.string(),
		}),
		ready: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const updateData: {
			content: { yesterday: string; today: string };
			ready?: boolean;
		} = {
			content: args.content,
		};

		if (args.ready !== undefined) {
			updateData.ready = args.ready;
		}

		return await ctx.db.patch(args.id, updateData);
	},
});

export const setReady = mutation({
	args: {
		id: v.id('update'),
		ready: v.boolean(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.patch(args.id, {
			ready: args.ready,
		});
	},
});

export const getPreviousUpdateByUserId = query({
	args: {
		userId: v.id('user'),
		currentStandupId: v.id('standup'),
	},
	handler: async (ctx, args) => {
		// Get all user's updates ordered by creation time (most recent first)
		const userUpdates = await ctx.db
			.query('update')
			.withIndex('userId', (q) => q.eq('userId', args.userId))
			.order('desc')
			.collect();

		// Find the most recent update from a completed standup (excluding current standup)
		for (const update of userUpdates) {
			if (update.standupId === args.currentStandupId) continue;

			const standup = await ctx.db.get(update.standupId);
			if (standup?.finishedAt !== 0) {
				// Return only the "today" content
				return {
					today: update.content.today,
				};
			}
		}

		return null;
	},
});
