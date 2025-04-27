import z from 'zod';
import type { Id } from '../../convex/_generated/dataModel';

export const userSchema = z.interface({
	id: z.custom<Id<'user'>>(),
	name: z.string(),
});

export type User = z.infer<typeof userSchema>;
