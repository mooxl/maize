import { v } from 'convex/values';
import { query } from './_generated/server';

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
			.filter((q) => q.eq(q.field('state'), args.state))
			.collect();
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
