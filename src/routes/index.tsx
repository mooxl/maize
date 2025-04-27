import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { MicVocal } from 'lucide-react';
import { api } from '../../convex/_generated/api';

const todayStandupsQuery = convexQuery(api.standup.get, {
	state: 'created',
});

export const Route = createFileRoute('/')({
	loader: async ({ context: { queryClient } }) => {
		const todayStandups = await queryClient.ensureQueryData(todayStandupsQuery);
		return { todayStandups };
	},
	component: () => <Page />,
});

const Page = () => {
	const loaderData = Route.useLoaderData();
	const { data: todayStandups } = useQuery({
		...todayStandupsQuery,
		initialData: loaderData.todayStandups,
	});
	return (
		<div className="flex flex-col gap-y-4">
			<h2 className="text-3xl font-semibold">Today's Stand-up</h2>
			{todayStandups?.map((standup) => (
				<Card key={standup._id} className="flex flex-row justify-between p-4">
					<div className="flex items-center gap-x-4">
						<div className="rounded-full bg-primary/15 w-12 h-12 flex items-center justify-center">
							<MicVocal />
						</div>
						<div className="flex flex-col justify-between">
							<p className="text-base font-medium">{standup.name}</p>
							<p className="text-sm text-muted-foreground">
								{standup.scheduledTime}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-x-4">
						<Link
							to="/standups/$standupId"
							params={{ standupId: standup._id }}
							className={buttonStyles({
								intent: 'outline',
								size: 'large',
							})}
						>
							Start
						</Link>
						<Link
							to="/standups/$standupId/notes"
							params={{ standupId: standup._id }}
							className={buttonStyles({
								intent: 'primary',
								size: 'large',
							})}
						>
							Prepare
						</Link>
					</div>
				</Card>
			))}
		</div>
	);
};
