import type { User } from '@/schemas/user';
import { atomWithStorage } from 'jotai/utils';

export const userAtom = atomWithStorage<User | null>('user', null);
