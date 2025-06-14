import { Editor } from '@/components/editor';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { Avatar, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const updateQuery = (userId: Id<'user'>, standupId: Id<'standup'>) =>
	convexQuery(api.update.getByUserIdAndStandupId, {
		userId,
		standupId,
	});

const standupQuery = (id: Id<'standup'>) =>
	convexQuery(api.standup.getByIdWithUsersAndUpdates, {
		id,
	});

const previousUpdateQuery = (
	userId: Id<'user'>,
	currentStandupId: Id<'standup'>,
) =>
	convexQuery(api.update.getPreviousUpdateByUserId, {
		userId,
		currentStandupId,
	});

export const Route = createFileRoute('/$standupId/update')({
	loader: async ({ context: { queryClient, user }, params: { standupId } }) => {
		if (!user) {
			return null;
		}
		const update = await queryClient.ensureQueryData(
			updateQuery(user._id, standupId as Id<'standup'>),
		);
		const standup = await queryClient.ensureQueryData(
			convexQuery(api.standup.getByIdWithUsersAndUpdates, {
				id: standupId as Id<'standup'>,
			}),
		);
		if (standup?.finishedAt !== 0) {
			throw redirect({
				to: '/$standupId',
				params: {
					standupId,
				},
			});
		}
		return { update, standup };
	},
	component: () => <Page />,
});

const Page = () => {
	const { standupId } = Route.useParams();
	const loaderData = Route.useLoaderData();
	const { user } = Route.useRouteContext();

	const { data: update } = useQuery({
		...updateQuery(user?._id as Id<'user'>, standupId as Id<'standup'>),
		initialData: loaderData?.update,
	});

	const { data: previousUpdate } = useQuery({
		...previousUpdateQuery(user?._id as Id<'user'>, standupId as Id<'standup'>),
	});

	const { data: standup } = useQuery({
		...standupQuery(standupId as Id<'standup'>),
		initialData: loaderData?.standup,
	});

	const { mutateAsync: createUpdate } = useMutation({
		mutationFn: useConvexMutation(api.update.create),
	});
	const { mutateAsync: updateUpdate } = useMutation({
		mutationFn: useConvexMutation(api.update.update),
	});
	const { mutate: setReady } = useMutation({
		mutationFn: useConvexMutation(api.update.setReady),
	});

	const [content, setContent] = useState({
		yesterday: update?.content.yesterday ?? '',
		today: update?.content.today ?? '',
	});

	if (
		update &&
		(content.yesterday !== (update.content.yesterday ?? '') ||
			content.today !== (update.content.today ?? ''))
	) {
		setContent({
			yesterday: update.content.yesterday ?? '',
			today: update.content.today ?? '',
		});
	}

	const saveUpdate = useCallback(
		async (contentToSave: typeof content) => {
			if (standup?.finishedAt !== 0) return;
			if (!contentToSave.yesterday && !contentToSave.today) return;
			if (update) {
				await updateUpdate({
					id: update._id,
					content: contentToSave,
				});
			} else {
				await createUpdate({
					standupId: standupId as Id<'standup'>,
					userId: user?._id as Id<'user'>,
					content: contentToSave,
					ready: false,
				});
			}
		},
		[
			update,
			updateUpdate,
			createUpdate,
			standupId,
			user?._id,
			standup?.finishedAt,
		],
	);

	const debouncedSave = useMemo(() => {
		let timeoutId: number;
		return (contentToSave: { yesterday: string; today: string }) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				saveUpdate(contentToSave);
			}, 500);
		};
	}, [saveUpdate]);

	const handleContentChange = (field: 'yesterday' | 'today', value: string) => {
		const newContent = { ...content, [field]: value };
		setContent(newContent);
		debouncedSave(newContent);
	};

	const handleReady = async () => {
		await saveUpdate(content);
		if (update) {
			setReady({
				id: update._id,
				ready: true,
			});
			notifications.show({
				title: 'Ready for standup',
				message: 'Your update has been saved and you are ready for the standup',
				position: 'bottom-left',
			});
		}
	};

	const hasContent = Boolean(content.yesterday || content.today);
	const isReady = update?.ready;
	const isStandupFinished = standup?.finishedAt !== 0;

	return (
		<>
			{previousUpdate?.today && (
				<div className="space-y-4">
					<div className="flex items-center gap-x-2">
						<Avatar size="md">💬</Avatar>
						<div>
							<p className="text-lg font-bold">Previous Commitments</p>
							<p className="text-sm">What you said you'd accomplish</p>
						</div>
					</div>
					<Editor content={previousUpdate.today} editable={false} />
				</div>
			)}

			<div className="space-y-4">
				<div className="flex items-center gap-x-2">
					<Avatar size="md">✔️</Avatar>
					<div>
						<p className="text-lg font-bold">Yesterday's Work</p>
						<p className="text-sm">What you actually accomplished</p>
					</div>
				</div>
				<Editor
					content={content.yesterday}
					editable={!isStandupFinished}
					mih={200}
					onChange={(value) =>
						handleContentChange('yesterday', value as string)
					}
				/>
			</div>

			<div className="space-y-4">
				<div className="flex items-center gap-x-2">
					<Avatar size="md">🎯</Avatar>
					<div>
						<p className="text-lg font-bold">Today's Goals</p>
						<p className="text-sm">What you plan to accomplish today</p>
					</div>
				</div>
				<Editor
					content={content.today}
					editable={!isStandupFinished}
					mih={200}
					onChange={(value) => handleContentChange('today', value as string)}
				/>
			</div>

			<div className="flex justify-end">
				<Button
					disabled={isStandupFinished || !hasContent || isReady}
					onClick={handleReady}
					variant={isReady ? 'filled' : hasContent ? 'filled' : 'light'}
				>
					{isReady
						? 'Ready'
						: hasContent
							? 'Ready for Standup'
							: 'Add content to get ready'}
				</Button>
			</div>
		</>
	);
};
