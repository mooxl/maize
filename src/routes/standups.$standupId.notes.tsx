import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/standups/$standupId/notes')({
	loader: async ({ context: { queryClient }, params: { standupId } }) => {
		return null;
	},
	component: () => <Page />,
});

const Page = () => {
	const { standupId } = Route.useParams();
	const loaderData = Route.useLoaderData();

	return <section className="flex flex-col gap-y-4">notes</section>;
};
