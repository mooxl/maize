import { Avatar } from '@/components/ui/avatar';
import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { MicVocal } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const standupQuery = (id: string) =>
	convexQuery(api.standup.getById, {
		id: id as Id<'standup'>,
	});

export const Route = createFileRoute('/standups/$standupId')({
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
	if (!standup) return <div>Standup not found</div>;
	return (
		<section className="flex flex-col gap-y-8 h-full">
			<div className="flex items-center gap-x-4">
				<Avatar size="extra-large" icon={<MicVocal />} />

				<div>
					<h1 className="text-xl font-semibold">{standup.name}</h1>
					<p className="text-sm">{standup.scheduledTime}</p>
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
					to="/standups/$standupId/notes"
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
					Your Notes
				</Link>
			</Card>
			<Outlet />
		</section>
	);
};
