import { z } from 'zod';

export const standupsStandupIdSchema = z.object({
	tab: z.enum(['standup', 'notes']).optional(),
});
