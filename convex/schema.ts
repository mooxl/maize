import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	user: defineTable({
		name: v.string(),
		email: v.string(),
		picture: v.string(),
	}).index('email', ['email']),
	standup: defineTable({
		name: v.string(),
		description: v.string(),
		emoji: v.optional(v.string()),
		startedAt: v.number(),
		finishedAt: v.number(),
		currentUser: v.optional(v.id('user')),
		icebreaker: v.optional(v.string()),
	}).index('currentUser', ['currentUser']),
	standup_user: defineTable({
		standupId: v.id('standup'),
		userId: v.id('user'),
		order: v.number(),
	})
		.index('userId', ['userId'])
		.index('standupId', ['standupId']),
	update: defineTable({
		standupId: v.id('standup'),
		userId: v.id('user'),
		content: v.object({
			yesterday: v.string(),
			today: v.string(),
		}),
		startedAt: v.number(),
		finishedAt: v.number(),
		ready: v.optional(v.boolean()),
	})
		.index('userId', ['userId'])
		.index('standupId', ['standupId']),
});
