import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	user: defineTable({
		name: v.string(),
		taskIds: v.array(v.id('task')),
	}),
	task: defineTable({
		text: v.string(),
		userId: v.id('user'),
	}),
	standup: defineTable({
		userIds: v.array(v.id('user')),
		name: v.string(),
		scheduledTime: v.string(),
		state: v.union(
			v.literal('created'),
			v.literal('started'),
			v.literal('completed'),
		),
	}),
	update: defineTable({
		standupId: v.id('standup'),
		userId: v.id('user'),
		content: v.object({
			yesterday: v.string(),
			today: v.string(),
			blockers: v.string(),
		}),
	}),
});
