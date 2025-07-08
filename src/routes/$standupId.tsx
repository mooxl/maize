import { Timer } from '@/components/timer';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { Avatar, Button, SegmentedControl } from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Outlet,
	createFileRoute,
	useNavigate,
	useRouterState,
} from '@tanstack/react-router';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const standupQuery = (id: string) =>
	convexQuery(api.standup.getByIdWithUsersAndUpdates, {
		id: id as Id<'standup'>,
	});

export const Route = createFileRoute('/$standupId')({
	loader: async ({ context: { queryClient, user }, params: { standupId } }) => {
		const standup = await queryClient.ensureQueryData(standupQuery(standupId));
		return { standup, user };
	},
	component: () => <Page />,
});

const Page = () => {
	const { standupId } = Route.useParams();
	const loaderData = Route.useLoaderData();
	const { user } = Route.useRouteContext();
	const location = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();

	const { mutate: removeUser } = useMutation({
		mutationFn: useConvexMutation(api.standup_user.remove),
		onSuccess: () => {
			navigate({ to: '/$standupId', params: { standupId } });
		},
	});
	const { mutate: joinStandup } = useMutation({
		mutationFn: useConvexMutation(api.standup_user.join),
	});

	const { data: standup } = useQuery({
		...standupQuery(standupId),
		initialData: loaderData.standup,
	});

	const userIsJoined = standup.users.some((u) => u._id === user?._id);

	if (!standup) return <div>Standup not found</div>;

	return (
		<section className="flex flex-col gap-y-8 h-full">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-x-4">
					<Avatar size="lg">{standup.emoji}</Avatar>
					<div>
						<h1 className="text-xl font-semibold">{standup.name}</h1>
						<p className="text-sm">{standup.description}</p>
					</div>
				</div>
				<div className="flex items-center gap-x-4">
					{standup.startedAt !== 0 && (
						<Timer
							startedAt={standup.startedAt ?? 0}
							finishedAt={standup.finishedAt}
							size="lg"
							classNames={{
								root: 'bg-gray-100!',
								label: 'text-gray-500 flex items-center gap-x-2!',
							}}
						/>
					)}
					{standup.finishedAt === 0 && user && (
						<div>
							{userIsJoined ? (
								<Button
									disabled={(() => {
										const update = standup.updates.find(
											(u) => u.userId === user._id,
										);
										return update && update.startedAt !== 0;
									})()}
									variant="light"
									color="red"
									onClick={() =>
										removeUser({
											standupId: standup._id as Id<'standup'>,
											userId: user._id,
										})
									}
								>
									Leave
								</Button>
							) : (
								<Button
									variant="light"
									onClick={() =>
										joinStandup({
											standupId: standup._id as Id<'standup'>,
											userId: user._id,
										})
									}
								>
									Join
								</Button>
							)}
						</div>
					)}
				</div>
			</div>
			{standup.finishedAt === 0 && (
				<SegmentedControl
					disabled={!userIsJoined}
					value={location.includes('update') ? 'update' : '..'}
					onChange={(value) => navigate({ to: value })}
					data={[
						{ label: 'Stand-up', value: '..' },
						{ label: 'Your update', value: 'update' },
					]}
				/>
			)}
			<Outlet />
		</section>
	);
};
