import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const get = query({
	args: {},
	handler: async (ctx, args) => {
		const tasks = await ctx.db.query('task').collect();
		return tasks;
	},
});

export const create = mutation({
	args: {
		userId: v.id('user'),
		text: v.string(),
	},
	handler: async (ctx, args) => {
		const taskId = await ctx.db.insert('task', {
			userId: args.userId,
			text: args.text,
		});
		console.log(taskId);
	},
});
