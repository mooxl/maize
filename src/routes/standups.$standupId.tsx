import { Avatar } from '@/components/ui/avatar';
import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
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
	const { data: standup } = useQuery({
		...standupQuery(standupId),
		initialData: loaderData.standup,
	});
	const { mutate: joinStandup } = useMutation({
		mutationFn: useConvexMutation(api.standup.join),
	});
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
				<Avatar size="extra-large" icon={<MicVocal />} />

				<div>
					<h1 className="text-xl font-semibold">{standup.name}</h1>
					<p className="text-sm">{standup.description}</p>
				</div>
			</div>
			<Card className=" rounded-sm flex flex-row items-center justify-between p-1 gap-x-1">
				<Link
					to="/standups/$standupId"
					params={{ standupId }}
					activeOptions={{ exact: true }}
					activeProps={{
						className: buttonStyles({
							intent: 'primary',
							size: 'small',
						}),
					}}
					className={`${buttonStyles({
						intent: 'plain',
						size: 'small',
					})} rounded-xs flex-1/2`}
				>
					Stand-up
				</Link>
				<Link
					to="/standups/$standupId/update"
					params={{ standupId }}
					activeOptions={{ exact: true }}
					activeProps={{
						className: buttonStyles({
							intent: 'primary',
							size: 'small',
						}),
					}}
					className={`${buttonStyles({
						intent: 'plain',
						size: 'small',
					})} rounded-xs flex-1/2`}
				>
					Your update
				</Link>
			</Card>
			<Outlet />
		</section>
	);
};
