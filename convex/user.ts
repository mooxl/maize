import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getByEmail = query({
	args: {
		email: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('user')
			.withIndex('email', (q) => q.eq('email', args.email))
			.unique();
		return user;
	},
});

export const store = mutation({
	args: {
		name: v.string(),
		email: v.string(),
		picture: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('user')
			.withIndex('email', (q) => q.eq('email', args.email))
			.unique();
		if (user !== null) {
			return;
		}
		// If it's a new identity, create a new User.
		return await ctx.db.insert('user', {
			name: args.name,
			email: args.email,
			picture: args.picture,
		});
	},
});
