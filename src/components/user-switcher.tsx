import { userAtom } from '@/states/user';
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

	return (
		<Popover isOpen={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger>
				<Avatar
					size="large"
					initials={user?.text
						.split(' ')
						.map((name) => name[0])
						.join('')}
				/>
			</Popover.Trigger>
			<Popover.Content className="p-4 flex flex-col gap-y-2">
				{users?.map((userItem) => (
					<Button
						key={userItem._id}
						size="small"
						className="my-1"
						intent={userItem._id === user?.userId ? 'primary' : 'outline'}
						onClick={() => {
							setUser({ userId: userItem._id, text: userItem.name });
							setIsOpen(false);
						}}
					>
						{userItem.name}
					</Button>
				))}
			</Popover.Content>
		</Popover>
	);
};
