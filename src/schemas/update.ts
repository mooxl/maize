import { zid } from 'convex-helpers/server/zod';
import z from 'zod';

export const updateSchema = z.object({
	_id: zid('update'),
	standupId: zid('standup'),
	userId: zid('user'),
	content: z.object({
		yesterday: z.string(),
		today: z.string(),
	}),
	startedAt: z.number(),
	finishedAt: z.number(),
	ready: z.optional(z.boolean()),
});

export type Update = z.infer<typeof updateSchema>;
