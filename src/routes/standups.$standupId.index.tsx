import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const standupQuery = (id: string) =>
	convexQuery(api.standup.getById, {
		id: id as Id<'standup'>,
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
	if (standup === null) {
		return <div>Standup not found</div>;
	}
	return (
		<section className="flex gap-4 min-h-1/2">
			<Card className="flex-1/3">
				<CardHeader>
					<CardTitle>Order</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-y-2">
						<div className="flex items-center gap-x-2">
							<div className="w-10 h-10 rounded-full bg-primary/20" />
						</div>
					</div>
				</CardContent>
			</Card>
			<Card className="flex-2/3">
				{(() => {
					switch (standup.state) {
						case 'created':
							return (
								<CardContent className="flex items-center justify-center h-full flex-col gap-y-4">
									<h3 className="text-2xl font-semibold">
										Stand-up has not started yet
									</h3>
									<Button size="large">Start Stand-up</Button>
								</CardContent>
							);
						case 'started':
							return <div>Started</div>;
						case 'completed':
							return <div>Completed</div>;
					}
				})()}
			</Card>
		</section>
	);
};
