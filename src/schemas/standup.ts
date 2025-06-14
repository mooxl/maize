import { zid } from 'convex-helpers/server/zod';
import z from 'zod';

export const standupSchema = z.object({
	_id: zid('standup'),
	name: z.string(),
	description: z.string(),
	emoji: z.optional(z.string()),
	startedAt: z.number(),
	finishedAt: z.number(),
	currentUser: z.optional(zid('user')),
	icebreaker: z.optional(z.string()),
});

export type Standup = z.infer<typeof standupSchema>;
