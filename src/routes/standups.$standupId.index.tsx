import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { Avatar, Badge, Button, Divider, Paper } from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Shuffle, Users } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const standupQuery = (id: string) =>
	convexQuery(api.standup.getById, {
		id: id as Id<'standup'>,
	});

const userQuery = (id: string | Id<'user'>) =>
	convexQuery(api.user.getById, {
		id: id as Id<'user'>,
	});

export const Route = createFileRoute('/standups/$standupId/')({
	loader: async ({ context: { queryClient }, params: { standupId } }) => {
		const standup = await queryClient.ensureQueryData(standupQuery(standupId));
		return { standup };
	},
	component: () => <Page />,
});

const Page = () => {
	const { standupId } = Route.useParams();
	const loaderData = Route.useLoaderData();

	const { data: standup } = useQuery({
		...standupQuery(standupId),
		initialData: loaderData.standup,
	});

	const { mutate: shuffle } = useMutation({
		mutationFn: useConvexMutation(api.standup.shuffle),
	});

	if (standup === null) {
		return <div>Standup not found</div>;
	}
	console.log(standup);
	return (
		<section className="flex gap-4 min-h-1/2">
			<Paper classNames={{ root: 'flex-1/3 p-4 space-y-4' }} withBorder>
				<div className="flex items-center justify-between ">
					<div className="flex items-center gap-x-2">
						<Users />
						<p className="text-lg font-semibold">Team</p>
					</div>
					<Button
						variant="light"
						size="xs"
						onClick={() => shuffle({ id: standup._id })}
						classNames={{ label: 'flex items-center gap-x-2!' }}
					>
						<Shuffle size={16} />
						Shuffle
					</Button>
				</div>
				<Divider orientation="horizontal" />
				<div>
					<div className="space-y-4">
						{standup.users.map((user, i) => {
							if (!user) {
								return null;
							}
							return (
								<div key={user?._id} className="flex items-center gap-x-4">
									<Avatar size="md" color="gray">
										{user?.name.slice(0, 2)}
									</Avatar>
									<div className="flex flex-col">
										<p className="text-base font-semibold">{user?.name}</p>
										{
											// @ts-expect-error: Ger updates and check it there
											standup.updateIds.includes(user._id) ? (
												<Badge color="green" size="xs">
													Ready
												</Badge>
											) : (
												<Badge
													classNames={{ root: 'bg-orange-400!' }}
													size="xs"
												>
													Not Ready
												</Badge>
											)
										}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</Paper>
			<Paper className="flex-2/3 p-4" withBorder>
				{(() => {
					if (standup.startedAt === 0) {
						return (
							<div className="flex items-center justify-center h-full flex-col gap-y-4">
								<h3 className="text-2xl font-semibold">
									Stand-up has not started yet
								</h3>
								<Button size="large">Start Stand-up</Button>
							</div>
						);
					}
					if (standup.finishedAt === 0) {
						return <div>Started</div>;
					}
					return <div>Completed</div>;
				})()}
			</Paper>
		</section>
	);
};
