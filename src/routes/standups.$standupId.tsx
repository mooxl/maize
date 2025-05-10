import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { Avatar, SegmentedControl } from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Outlet,
	createFileRoute,
	useNavigate,
	useRouterState,
} from '@tanstack/react-router';
import { MicVocal } from 'lucide-react';
import { useEffect } from 'react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const standupQuery = (id: string) =>
	convexQuery(api.standup.getById, {
		id: id as Id<'standup'>,
	});

export const Route = createFileRoute('/standups/$standupId')({
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
	const navigate = useNavigate();

	const { data: standup } = useQuery({
		...standupQuery(standupId),
		initialData: loaderData.standup,
	});
	const { mutate: joinStandup } = useMutation({
		mutationFn: useConvexMutation(api.standup.join),
	});
	const location = useRouterState({ select: (s) => s.location.pathname });

	useEffect(() => {
		if (
			user &&
			standup &&
			!standup.userIds.includes(user.id) &&
			standup.finishedAt === 0
		) {
			joinStandup({ id: standup._id, userId: user.id });
		}
	}, [user, standup, joinStandup]);

	if (!standup) return <div>Standup not found</div>;

	return (
		<section className="flex flex-col gap-y-8 h-full">
			<div className="flex items-center gap-x-4">
				<Avatar size="lg">
					<MicVocal />
				</Avatar>
				<div>
					<h1 className="text-xl font-semibold">{standup.name}</h1>
					<p className="text-sm">{standup.description}</p>
				</div>
			</div>
			<SegmentedControl
				value={
					location.includes('update')
						? '/standups/$standupId/update'
						: '/standups/$standupId'
				}
				onChange={(value) => navigate({ to: value })}
				data={[
					{ label: 'Stand-up', value: '/standups/$standupId' },
					{ label: 'Your update', value: '/standups/$standupId/update' },
				]}
			/>

			<Outlet />
		</section>
	);
};
