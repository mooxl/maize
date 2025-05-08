import { userAtom } from '@/states/user';
import { getInitials } from '@/utils/helpers';
import { Avatar, Button, Popover } from '@mantine/core';
import { useRouter } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { useAtom } from 'jotai/react';
import { useState } from 'react';
import { api } from '../../convex/_generated/api';
export const UserSwitcher = () => {
	const [opened, setOpened] = useState(false);
	const users = useQuery(api.user.get);
	const [user, setUser] = useAtom(userAtom);
	const router = useRouter();
	return (
		<Popover opened={opened} onChange={setOpened} position="right-end">
			<Popover.Target>
				<Avatar
					size="lg"
					radius="md"
					color="blue"
					onClick={() => setOpened((o) => !o)}
				>
					{getInitials(user?.name ?? '')}
				</Avatar>
			</Popover.Target>
			<Popover.Dropdown className="p-4 flex flex-col gap-y-2">
				{users?.map((userItem) => (
					<Button
						key={userItem._id}
						size="small"
						variant={userItem._id === user?.id ? 'filled' : 'light'}
						onClick={() => {
							setUser({ id: userItem._id, name: userItem.name });
							setOpened(false);
							router.invalidate();
						}}
					>
						{userItem.name}
					</Button>
				))}
			</Popover.Dropdown>
		</Popover>
	);
};
