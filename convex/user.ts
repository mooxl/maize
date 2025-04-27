import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const get = query({
	handler: async (ctx) => {
		const users = await ctx.db.query('user').collect();
		return users;
	},
});

export const getById = query({
	args: {
		id: v.id('user'),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.id);
		return user;
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
