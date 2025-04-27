import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const get = query({
	args: {},
	handler: async (ctx, args) => {
		const users = await ctx.db.query('user').collect();
		return users;
	},
});

export const create = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await ctx.db.insert('user', {
			name: args.name,
			taskIds: [],
		});
		console.log(userId);
	},
});
