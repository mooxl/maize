import { Editor } from '@/components/editor';
import { Status } from '@/components/status';
import { Timer } from '@/components/timer';
import { iceBreakers } from '@/data/ice-breakers.json';
import { formatDuration } from '@/utils/helpers';
import { isUserReady } from '@/utils/user';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import {
	DragDropContext,
	Draggable,
	type DraggableProvided,
	type DropResult,
	Droppable,
	type DroppableProvided,
} from '@hello-pangea/dnd';
import {
	Accordion,
	ActionIcon,
	Alert,
	Avatar,
	Badge,
	Button,
	Divider,
	Paper,
} from '@mantine/core';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import {
	ArrowLeft,
	ArrowRight,
	ArrowRightFromLine,
	Check,
	Clock,
	GripVertical,
	SaveAll,
	Shuffle,
	Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { z } from 'zod';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const standupQuery = (id: string) =>
	convexQuery(api.standup.getByIdWithUsersAndUpdates, {
		id: id as Id<'standup'>,
	});

export const Route = createFileRoute('/$standupId/')({
	validateSearch: z.object({
		userId: z.string().optional(),
	}),
	loader: async ({ context: { queryClient }, params: { standupId } }) => {
		const standup = await queryClient.ensureQueryData(standupQuery(standupId));
		return { standup };
	},
	component: () => <Page />,
});

const Page = () => {
	const { standupId } = Route.useParams();
	const loaderData = Route.useLoaderData();
	const { userId } = Route.useSearch();
	const { data: standup } = useSuspenseQuery({
		...standupQuery(standupId),
		initialData: loaderData.standup,
	});

	const { mutate: shuffle } = useMutation({
		mutationFn: useConvexMutation(api.standup_user.shuffle),
	});

	const { mutate: startStandup } = useMutation({
		mutationFn: useConvexMutation(api.standup.start),
	});

	const { mutate: next } = useMutation({
		mutationFn: useConvexMutation(api.standup.next),
	});

	const { mutate: previous } = useMutation({
		mutationFn: useConvexMutation(api.standup.previous),
	});

	const { mutate: skip } = useMutation({
		mutationFn: useConvexMutation(api.standup.skip),
	});

	const { mutate: finish } = useMutation({
		mutationFn: useConvexMutation(api.standup.finish),
	});

	const { mutate: setIcebreaker } = useMutation({
		mutationFn: useConvexMutation(api.standup.setIcebreaker),
	});

	const { mutate: reorder } = useMutation({
		mutationFn: useConvexMutation(
			api.standup_user.reorder,
		).withOptimisticUpdate((localStore, args) => {
			const { standupId, userId, to } = args;
			const standup = localStore.getQuery(
				api.standup.getByIdWithUsersAndUpdates,
				{ id: standupId },
			);
			if (standup?.users) {
				const newUsers = [...standup.users];
				const fromIndex = newUsers.findIndex((u) => u._id === userId);
				if (fromIndex !== -1) {
					const [movedUser] = newUsers.splice(fromIndex, 1);
					if (movedUser) {
						newUsers.splice(to, 0, movedUser);
					}
				}
				localStore.setQuery(
					api.standup.getByIdWithUsersAndUpdates,
					{ id: standupId },
					{ ...standup, users: newUsers },
				);
			}
		}),
	});

	if (standup === null) {
		return <div>Standup not found</div>;
	}

	const {
		currentUser,
		currentUpdate,
		currentIndex,
		nextUser,
		previousUser,
		viewingUser,
		viewingUpdate,
	} = useMemo(() => {
		const currentUser = standup.users.find(
			(user) => user._id === standup.currentUser,
		);
		const currentIndex = standup.users.findIndex(
			(user) => user._id === standup.currentUser,
		);
		const currentUpdate = standup.updates.find(
			(update) => update.userId === standup.currentUser,
		);
		const previousUser =
			standup.users[
				standup.users.findIndex((user) => user._id === standup.currentUser) - 1
			];
		const nextUser =
			standup.users[
				standup.users.findIndex((user) => user._id === standup.currentUser) + 1
			];

		// Get the user and update being viewed (from search params)
		const viewingUser = userId
			? standup.users.find((user) => user._id === userId)
			: currentUser;
		const viewingUpdate = userId
			? standup.updates.find((update) => update.userId === userId)
			: currentUpdate;

		return {
			currentUser,
			currentUpdate,
			currentIndex,
			nextUser,
			previousUser,
			viewingUser,
			viewingUpdate,
		};
	}, [standup.users, standup.currentUser, standup.updates, userId]);
	const handleDragEnd = (result: DropResult) => {
		const to = result.destination?.index;
		if (to === undefined || !standup._id) return;
		reorder({
			standupId: standup._id,
			userId: result.draggableId as Id<'user'>,
			to,
		});
	};
	return (
		<section className="flex gap-4 h-[calc(100vh-18rem)]">
			{standup.finishedAt === 0 && (
				<Paper
					classNames={{
						root: 'flex-1/3 p-4 flex! flex-col justify-between',
					}}
					withBorder
				>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-x-2">
							<Users />
							<p className="text-lg font-semibold">Team</p>
						</div>
						<Button
							variant="light"
							size="xs"
							disabled={standup.startedAt !== 0}
							onClick={() =>
								shuffle({ standupId: standup._id as Id<'standup'> })
							}
							classNames={{ label: 'flex items-center gap-x-2!' }}
						>
							<Shuffle size={16} />
							Shuffle
						</Button>
					</div>
					<Divider orientation="horizontal" />
					<div className="h-full overflow-y-scroll py-4">
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="yes">
								{(provided: DroppableProvided) => (
									<div {...provided.droppableProps} ref={provided.innerRef}>
										{standup.users.map((user, index) => (
											<Draggable
												key={user._id}
												draggableId={user._id}
												index={index}
											>
												{(provided: DraggableProvided) => {
													const userElement = (
														<div
															className={`flex items-center justify-between w-full py-2 rounded-md mb-2 ${standup.startedAt !== 0 ? 'hover:bg-blue-100 transition-colors cursor-pointer' : ''}`}
															ref={provided.innerRef}
															{...provided.draggableProps}
														>
															<div className="flex gap-x-2">
																{index < currentIndex ? (
																	<div className="rounded-full size-11 bg-blue-200 text-blue-400 flex items-center justify-center">
																		<Check />
																	</div>
																) : (
																	<img
																		className={`rounded-full size-11 overflow-hidden border-3 ${currentIndex === index ? 'border-blue-400' : 'border-gray-200'}`}
																		src={user.picture}
																		alt="profile"
																	/>
																)}

																<div className="flex flex-col">
																	<p className="font-medium">{user.name}</p>
																	<Status
																		standupId={standup._id}
																		user={user}
																		updates={standup.updates}
																		currentUpdate={currentUpdate}
																		currentUser={standup.currentUser}
																	/>
																</div>
															</div>
															{standup.startedAt === 0 && (
																<ActionIcon
																	variant="subtle"
																	{...provided.dragHandleProps}
																>
																	<GripVertical />
																</ActionIcon>
															)}
														</div>
													);

													return standup.startedAt !== 0 ? (
														<Link
															to="/$standupId"
															params={{
																standupId: standup._id as Id<'standup'>,
															}}
															search={{
																userId:
																	currentUser?._id === user._id
																		? undefined
																		: user._id,
															}}
														>
															{userElement}
														</Link>
													) : (
														userElement
													);
												}}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</DragDropContext>
					</div>
					<Divider orientation="horizontal" />
					<div className="flex gap-x-2 items-end mt-4">
						<ActionIcon
							variant="subtle"
							size="lg"
							classNames={{
								icon: 'text-3xl',
							}}
							onClick={() => {
								setIcebreaker({
									standupId: standup._id as Id<'standup'>,
									icebreaker:
										iceBreakers[
											Math.floor(Math.random() * iceBreakers.length)
										] ?? '',
								});
							}}
						>
							🧊
						</ActionIcon>
						{standup.icebreaker && (
							<Alert
								variant="light"
								color="blue"
								classNames={{ root: 'p-3!' }}
								withCloseButton
								onClose={() => {
									setIcebreaker({
										standupId: standup._id as Id<'standup'>,
										icebreaker: '',
									});
								}}
							>
								{standup.icebreaker}
							</Alert>
						)}
					</div>
				</Paper>
			)}
			<Paper className="flex-2/3" withBorder>
				{(() => {
					if (standup.startedAt === 0) {
						return (
							<div className="flex items-center justify-center h-full flex-col gap-y-4">
								<h3 className="text-2xl font-semibold">
									Stand-up has not started yet
								</h3>
								{standup.users.length > 0 && (
									<Button
										size="large"
										disabled={
											standup.updates.length === 0 ||
											!isUserReady(standup.updates, standup.users[0]?._id ?? '')
										}
										onClick={() =>
											startStandup({
												id: standup._id as Id<'standup'>,
												userId: standup.users[0]?._id as Id<'user'>,
											})
										}
									>
										Start Stand-up
									</Button>
								)}
							</div>
						);
					}
					if (standup.finishedAt === 0) {
						const isViewingCurrent = !userId || userId === currentUser?._id;
						return (
							<div className="flex flex-col p-4">
								<div className="flex justify-between items-center mb-4">
									<div className="flex items-center gap-x-2">
										<Avatar src={viewingUser?.picture} size="lg" />
										<div>
											<p className="text-lg font-semibold">
												{viewingUser?.name}
											</p>
											{isViewingCurrent && (
												<Timer
													size="md"
													classNames={{
														root: 'bg-blue-100!',
														label:
															'text-blue-500/80 flex items-center gap-x-2!',
													}}
													startedAt={viewingUpdate?.startedAt ?? 0}
												/>
											)}
										</div>
									</div>
									<div className="flex gap-x-2">
										{!isViewingCurrent && (
											<Link
												to="/$standupId"
												params={{ standupId: standup._id as Id<'standup'> }}
												search={{ userId: undefined }}
											>
												<Button
													variant="light"
													size="sm"
													classNames={{ label: 'flex items-center gap-x-2!' }}
												>
													<ArrowLeft size={16} /> Back to {currentUser?.name}
												</Button>
											</Link>
										)}
										{isViewingCurrent && previousUser && (
											<Button
												variant="light"
												size="sm"
												classNames={{ label: 'flex items-center gap-x-2!' }}
												onClick={() =>
													previous({
														standupId: standup._id as Id<'standup'>,
														currentUser: currentUser?._id as Id<'user'>,
														previousUser: previousUser._id as Id<'user'>,
													})
												}
											>
												<ArrowLeft size={16} /> Previous
											</Button>
										)}
										{isViewingCurrent &&
											(nextUser ? (
												isUserReady(standup.updates, nextUser._id) ? (
													<Button
														variant="light"
														size="sm"
														classNames={{ label: 'flex items-center gap-x-2!' }}
														onClick={() =>
															next({
																standupId: standup._id as Id<'standup'>,
																currentUser: currentUser?._id as Id<'user'>,
																nextUser: nextUser?._id as Id<'user'>,
															})
														}
													>
														<ArrowRight size={16} /> Next
													</Button>
												) : (
													<Button
														variant="outline"
														size="sm"
														classNames={{ label: 'flex items-center gap-x-1!' }}
														onClick={() =>
															skip({
																standupId: standup._id as Id<'standup'>,
																currentUser: currentUser?._id as Id<'user'>,
																userToSkip: nextUser?._id as Id<'user'>,
															})
														}
													>
														<ArrowRightFromLine size={16} /> Skip
													</Button>
												)
											) : (
												<Button
													variant="light"
													size="sm"
													color="red"
													onClick={() =>
														finish({
															id: standup._id as Id<'standup'>,
															currentUpdateId:
																currentUpdate?._id as Id<'update'>,
														})
													}
												>
													Finish
												</Button>
											))}
									</div>
								</div>
								<Divider orientation="horizontal" />
								<div className="flex flex-col gap-y-4 overflow-y-auto max-h-[calc(100vh-25rem)]">
									<div className="flex flex-col gap-y-1 pt-4">
										<h3 className="text-lg font-semibold">Yesterday</h3>
										<Editor
											key={viewingUpdate?.content.yesterday}
											content={viewingUpdate?.content.yesterday ?? ''}
											editable={false}
										/>
									</div>
									<div className="flex flex-col gap-y-1">
										<h3 className="text-lg font-semibold">Today</h3>
										<Editor
											key={viewingUpdate?.content.today}
											content={viewingUpdate?.content.today ?? ''}
											editable={false}
										/>
									</div>
								</div>
							</div>
						);
					}
					return (
						<div className="flex flex-col">
							<div className="flex items-center gap-x-2 p-4">
								<SaveAll />
								<p className="text-lg font-semibold">Summary</p>
							</div>
							<Divider
								orientation="horizontal"
								classNames={{ root: 'mx-4!' }}
							/>
							<Accordion
								classNames={{
									root: 'overflow-y-auto max-h-[calc(100vh-22rem)] p-4',
								}}
								variant="separated"
								radius="md"
							>
								{standup.users.map((user) => {
									const userUpdate = standup.updates.find(
										(update) => update.userId === user._id,
									);
									return (
										<Accordion.Item key={user._id} value={user._id}>
											<Accordion.Control>
												<div className="flex items-center gap-x-3">
													<Avatar src={user.picture} size="md" />
													<div>
														<p className="text-lg font-semibold">{user.name}</p>
														<Badge
															classNames={{
																root: 'bg-gray-200!',
																label:
																	'text-gray-500/80 flex items-center gap-x-1',
															}}
														>
															<Clock size={12} />
															{formatDuration(
																(userUpdate?.finishedAt ?? 0) -
																	(userUpdate?.startedAt ?? 0),
															)}
														</Badge>
													</div>
												</div>
											</Accordion.Control>
											<Accordion.Panel>
												<div className="space-y-4">
													<p className="text-lg font-bold mb-2">
														Yesterday's Work
													</p>
													<Editor
														content={userUpdate?.content.yesterday ?? ''}
														editable={false}
													/>
													<div className="flex flex-col gap-y-1">
														<p className="text-lg font-bold mb-2">
															Today's Goals
														</p>
														<Editor
															content={userUpdate?.content.today ?? ''}
															editable={false}
														/>
													</div>
												</div>
											</Accordion.Panel>
										</Accordion.Item>
									);
								})}
							</Accordion>
						</div>
					);
				})()}
			</Paper>
		</section>
	);
};
