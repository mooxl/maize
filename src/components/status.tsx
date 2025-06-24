import type { Update } from '@/schemas/update';
import type { User } from '@/schemas/user';
import {
	isUserFinished,
	isUserPreparing,
	isUserReady,
	isUserStarted,
} from '@/utils/user';
import { useConvexMutation } from '@convex-dev/react-query';
import { Badge, Button, Popover } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

type Props = {
	standupId: Id<'standup'> | undefined;
	user: User;
	updates: Update[];
	currentUpdate: Update | undefined;
	currentUser: Id<'user'> | undefined;
};

export const Status = ({
	standupId,
	user,
	updates,
	currentUpdate,
	currentUser,
}: Props) => {
	const me = useRouteContext({
		from: '/$standupId',
		select: (ctx) => ctx.user,
	});
	const { mutate: removeUser } = useMutation({
		mutationFn: useConvexMutation(api.standup_user.remove),
	});

	const isReady = isUserReady(updates, user._id);
	const isPreparing = isUserPreparing(updates, user._id);
	const isStarted = isUserStarted(currentUpdate, currentUser, user._id);
	const isFinished = isUserFinished(updates, user._id);

	if (isStarted) {
		return (
			<Badge color="blue" size="xs">
				In Progress
			</Badge>
		);
	}

	if (isFinished) {
		return (
			<Badge color="gray" size="xs">
				Finished
			</Badge>
		);
	}

	if (isReady) {
		return (
			<Badge color="blue" size="xs">
				Ready
			</Badge>
		);
	}

	if (isPreparing) {
		return (
			<Badge color="yellow" size="xs">
				Preparing
			</Badge>
		);
	}
	console.log(me?._id, user._id);
	return (
		<div className="flex items-center gap-x-2">
			<Badge
				classNames={{
					root: 'bg-gray-100!',
					label: 'text-gray-500',
				}}
				size="xs"
			>
				Not Ready
			</Badge>
			{me?._id !== user._id && (
				<Popover position="right">
					<Popover.Target>
						<Badge
							classNames={{
								root: 'hover:bg-red-100!',
							}}
							variant="outline"
							size="xs"
							color="red"
						>
							x
						</Badge>
					</Popover.Target>
					<Popover.Dropdown>
						<p className="text-sm">
							Are you sure you want to delete this user?
						</p>

						<Button
							variant="light"
							size="xs"
							color="red"
							className="mt-2"
							onClick={() => {
								if (!standupId) return;
								removeUser({
									standupId,
									userId: user._id,
								});
							}}
						>
							Delete
						</Button>
					</Popover.Dropdown>
				</Popover>
			)}
		</div>
	);
};
