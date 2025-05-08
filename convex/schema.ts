import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	user: defineTable({
		name: v.string(),
		taskIds: v.array(v.id('task')),
	}),
	standup: defineTable({
		name: v.string(),
		description: v.string(),
		userIds: v.array(v.id('user')),
		updateIds: v.array(v.id('update')),
		startedAt: v.number(),
		finishedAt: v.number(),
	}),
	update: defineTable({
		standupId: v.id('standup'),
		userId: v.id('user'),
		content: v.object({
			yesterday: v.string(),
			today: v.string(),
			blockers: v.string(),
		}),
		startedAt: v.number(),
		finishedAt: v.number(),
	}),
});
