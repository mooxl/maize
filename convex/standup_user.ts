import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const join = mutation({
	args: {
		standupId: v.id('standup'),
		userId: v.id('user'),
	},
	handler: async (ctx, args) => {
		const [existing, count] = await Promise.all([
			ctx.db
				.query('standup_user')
				.filter((q) =>
					q.and(
						q.eq(q.field('standupId'), args.standupId),
						q.eq(q.field('userId'), args.userId),
					),
				)
				.first(),
			ctx.db
				.query('standup_user')
				.withIndex('standupId', (q) => q.eq('standupId', args.standupId))
				.collect(),
		]);
		if (existing) {
			return;
		}
		return await ctx.db.insert('standup_user', {
			...args,
			order: count.length,
		});
	},
});

export const remove = mutation({
	args: {
		standupId: v.id('standup'),
		userId: v.id('user'),
	},
	handler: async (ctx, args) => {
		const standupUser = await ctx.db
			.query('standup_user')
			.withIndex('standupId', (q) => q.eq('standupId', args.standupId))
			.filter((q) => q.eq(q.field('userId'), args.userId))
			.first();
		if (!standupUser) {
			return;
		}
		await ctx.db.delete(standupUser._id);
	},
});

export const shuffle = mutation({
	args: {
		standupId: v.id('standup'),
	},
	handler: async (ctx, args) => {
		const users = await ctx.db
			.query('standup_user')
			.withIndex('standupId', (q) => q.eq('standupId', args.standupId))
			.collect();
		const shuffled = users.sort(() => Math.random() - 0.5);
		await Promise.all(
			shuffled.map((user, index) =>
				ctx.db.patch(user._id, {
					order: index,
				}),
			),
		);
	},
});

export const reorder = mutation({
	args: {
		standupId: v.id('standup'),
		userId: v.id('user'),
		to: v.number(),
	},
	handler: async (ctx, args) => {
		const users = await ctx.db
			.query('standup_user')
			.withIndex('standupId', (q) => q.eq('standupId', args.standupId))
			.collect();

		const sortedUsers = users.toSorted((a, b) => a.order - b.order);
		const fromIndex = sortedUsers.findIndex((u) => u.userId === args.userId);
		if (fromIndex === -1) return;
		const [user] = sortedUsers.splice(fromIndex, 1);
		if (!user) return;
		sortedUsers.splice(args.to, 0, user);
		const updates = sortedUsers
			.filter((u, index) => u.order !== index)
			.map((u, index) => ctx.db.patch(u._id, { order: index }));

		await Promise.all(updates);
	},
});
