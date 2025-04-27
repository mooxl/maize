import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const get = query({
	args: {
		state: v.optional(
			v.union(
				v.literal('created'),
				v.literal('started'),
				v.literal('completed'),
			),
		),
	},
	handler: async (ctx, args) => {
		const standup = await ctx.db
			.query('standup')
			.filter((q) => {
				if (!args.state) {
					return q.neq(q.field('_id'), undefined);
				}
				switch (args.state) {
					case 'created':
						return q.eq(q.field('startedAt'), 0);
					case 'started':
						return q.and(
							q.neq(q.field('startedAt'), 0),
							q.eq(q.field('finishedAt'), 0),
						);
					case 'completed':
						return q.neq(q.field('finishedAt'), 0);
				}
			})
			.collect();
		console.log(standup);
		return standup;
	},
});

export const getById = query({
	args: {
		id: v.id('standup'),
	},
	handler: async (ctx, args) => {
		const standup = await ctx.db.get(args.id);
		return standup;
	},
});

export const join = mutation({
	args: {
		id: v.id('standup'),
		userId: v.id('user'),
	},
	handler: async (ctx, args) => {
		const standup = await ctx.db.get(args.id);
		if (!standup) {
			throw new Error('Standup not found');
		}
		if (standup.finishedAt !== 0) {
			throw new Error('Can not join standup that is already completed');
		}
		if (standup.userIds.includes(args.userId)) {
			throw new Error('User already joined standup');
		}
		await ctx.db.patch(args.id, {
			userIds: [...standup.userIds, args.userId],
		});
	},
});

export const shuffle = mutation({
	args: {
		id: v.id('standup'),
	},
	handler: async (ctx, args) => {
		const standup = await ctx.db.get(args.id);
		if (!standup) {
			throw new Error('Standup not found');
		}
		const shuffledUserIds = [...standup.userIds].sort(
			() => Math.random() - 0.5,
		);
		await ctx.db.patch(args.id, {
			userIds: shuffledUserIds,
		});
	},
});
