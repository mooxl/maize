import { Editor } from '@/components/editor';
import { Textarea } from '@/components/ui/textarea';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/standups/$standupId/update')({
	loader: async ({ context: { queryClient }, params: { standupId } }) => {
		return null;
	},
	component: () => <Page />,
});

const Page = () => {
	const { standupId } = Route.useParams();
	const loaderData = Route.useLoaderData();

	return (
		<section className="flex flex-col gap-y-4">
			<Editor />
			<Textarea />
		</section>
	);
};
