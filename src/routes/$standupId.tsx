import { Timer } from '@/components/timer';
import { convexQuery } from '@convex-dev/react-query';
import { Avatar, SegmentedControl } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import {
	Outlet,
	createFileRoute,
	useNavigate,
	useRouterState,
} from '@tanstack/react-router';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const standupQuery = (id: string) =>
	convexQuery(api.standup.getById, {
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
	const location = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();

	const { data: standup } = useQuery({
		...standupQuery(standupId),
		initialData: loaderData.standup,
	});

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
				{standup.startedAt !== 0 && standup.finishedAt === 0 && (
					<Timer
						startedAt={standup.startedAt}
						size="lg"
						classNames={{
							root: 'bg-gray-100!',
							label: 'text-gray-500 flex items-center gap-x-2!',
						}}
					/>
				)}
			</div>
			{standup.finishedAt === 0 && (
				<SegmentedControl
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
