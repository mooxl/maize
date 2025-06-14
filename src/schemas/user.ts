import { zid } from 'convex-helpers/server/zod';
import z from 'zod';

export const userSchema = z.object({
	_id: zid('user'),
	name: z.string(),
	email: z.string(),
	picture: z.string(),
});

export type User = z.infer<typeof userSchema>;
