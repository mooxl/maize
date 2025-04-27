import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
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
		const users = await Promise.all(
			standup?.userIds.map((userId) =>
				queryClient.ensureQueryData(userQuery(userId)),
			) ?? [],
		);
		return { standup, users };
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

	const users = useQueries({
		queries: standup
			? standup.userIds.map((userId) => ({
					...userQuery(userId),
					initialData: loaderData.users.find((user) => user?._id === userId),
				}))
			: [],
	});

	const { mutate: shuffle } = useMutation({
		mutationFn: useConvexMutation(api.standup.shuffle),
	});

	if (standup === null) {
		return <div>Standup not found</div>;
	}
	return (
		<section className="flex gap-4 min-h-1/2">
			<Card className="flex-1/3">
				<CardHeader className="flex items-center justify-between">
					<div className="flex items-center gap-x-2">
						<Users />
						<CardTitle>Team</CardTitle>
					</div>
					<Button intent="outline" onClick={() => shuffle({ id: standup._id })}>
						<Shuffle data-slot="icon" />
						Shuffle
					</Button>
				</CardHeader>
				<hr />
				<CardContent>
					<div className="flex flex-col gap-y-8">
						{users.map((user, i) => (
							<div key={user.data?._id} className="flex items-center gap-x-4">
								<Avatar size="large" initials={(i + 1).toString()} />
								<div>
									<p className="text-lg font-semibold">{user.data?.name}</p>
									<Badge intent="success">Ready</Badge>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
			<Card className="flex-2/3">
				{(() => {
					if (standup.startedAt === 0) {
						return (
							<CardContent className="flex items-center justify-center h-full flex-col gap-y-4">
								<h3 className="text-2xl font-semibold">
									Stand-up has not started yet
								</h3>
								<Button size="large">Start Stand-up</Button>
							</CardContent>
						);
					}
					if (standup.finishedAt === 0) {
						return <div>Started</div>;
					}
					return <div>Completed</div>;
				})()}
			</Card>
		</section>
	);
};
