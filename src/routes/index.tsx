import { convexQuery } from '@convex-dev/react-query';
import { Avatar, Button, Card } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
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
		<div className="flex flex-col gap-y-8">
			<h2 className="text-3xl font-semibold">Today's Stand-up</h2>
			{todayStandups?.map((standup) => (
				<Card key={standup._id} withBorder radius="md">
					<div className="flex justify-between">
						<div className="flex items-center gap-x-4">
							<Avatar size="lg">
								<MicVocal />
							</Avatar>
							<div className="flex flex-col gap-y-0.5 justify-between">
								<p className="text-base font-semibold">{standup.name}</p>
								<p className="text-sm ">{standup.description}</p>
							</div>
						</div>
						<div className="flex items-center gap-x-4">
							<Link
								to="/standups/$standupId"
								params={{ standupId: standup._id }}
							>
								<Button variant="light" size="md">
									Start
								</Button>
							</Link>
							<Link
								to="/standups/$standupId/update"
								params={{ standupId: standup._id }}
							>
								<Button size="md">Prepare</Button>
							</Link>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
};
