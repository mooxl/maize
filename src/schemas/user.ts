import z from 'zod';
import type { Id } from '../../convex/_generated/dataModel';

export const userSchema = z.interface({
	userId: z.custom<Id<'user'>>(),
	text: z.string(),
});

export type User = z.infer<typeof userSchema>;
