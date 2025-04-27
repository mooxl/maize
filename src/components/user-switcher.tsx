import { userAtom } from '@/states/user';
import { getInitials } from '@/utils/helpers';
import { useRouter } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { useAtom } from 'jotai/react';
import { useState } from 'react';
import { api } from '../../convex/_generated/api';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Popover } from './ui/popover';
export const UserSwitcher = () => {
	const [isOpen, setIsOpen] = useState(false);
	const users = useQuery(api.user.get);
	const [user, setUser] = useAtom(userAtom);
	const router = useRouter();
	return (
		<Popover isOpen={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger>
				<Avatar size="large" initials={getInitials(user?.name ?? '')} />
			</Popover.Trigger>
			<Popover.Content className="p-4 flex flex-col gap-y-2">
				{users?.map((userItem) => (
					<Button
						key={userItem._id}
						size="small"
						className="my-1"
						intent={userItem._id === user?.id ? 'primary' : 'outline'}
						onClick={() => {
							setUser({ id: userItem._id, name: userItem.name });
							setIsOpen(false);
							router.invalidate();
						}}
					>
						{userItem.name}
					</Button>
				))}
			</Popover.Content>
		</Popover>
	);
};
