import emojis from '@/data/emojis.json';
import { formatDuration } from '@/utils/helpers';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import {
	ActionIcon,
	Alert,
	Avatar,
	Button,
	Card,
	Modal,
	Popover,
	TextInput,
} from '@mantine/core';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const standupsQuery = convexQuery(api.standup.get, {});

const userStatsQuery = (userId: Id<'user'>) =>
	convexQuery(api.standup.getUserStats, { userId });

export const Route = createFileRoute('/')({
	loader: async ({ context: { queryClient, user } }) => {
		const [standups, userStats] = await Promise.all([
			queryClient.ensureQueryData(standupsQuery),
			queryClient.ensureQueryData(userStatsQuery(user?._id as Id<'user'>)),
		]);
		return { standups, userStats };
	},
	component: () => <Page />,
});

const Page = () => {
	const loaderData = Route.useLoaderData();
	const { user } = Route.useRouteContext();
	const [open, setOpen] = useState(false);
	const { Field, handleSubmit, reset } = useForm({
		defaultValues: {
			name: 'Daily',
			description: (() => {
				const today = new Date();
				const day = today.getDate().toString().padStart(2, '0');
				const month = (today.getMonth() + 1).toString().padStart(2, '0');
				const year = today.getFullYear();
				return `${day}.${month}.${year}`;
			})(),
			emoji:
				Object.values(emojis)[
					Math.floor(Math.random() * Object.values(emojis).length)
				],
		},
		onSubmit: async ({ value }) => {
			createStandup(value);
		},
	});
	const { data: standups } = useQuery({
		...standupsQuery,
		initialData: loaderData.standups,
	});
	const { data: userStats } = useQuery({
		...userStatsQuery(user?._id as Id<'user'>),
		initialData: loaderData.userStats,
	});
	const { mutate: createStandup, isPending: isCreatingStandup } = useMutation({
		mutationFn: useConvexMutation(api.standup.create),
		onSuccess: () => {
			setOpen(false);
			reset();
		},
	});
	const { mutateAsync: joinStandup } = useMutation({
		mutationFn: useConvexMutation(api.standup_user.join),
	});
	const { mutate: deleteStandup } = useMutation({
		mutationFn: useConvexMutation(api.standup.deleteStandup),
	});
	const { created, started, finished } = useMemo(() => {
		return {
			created: standups?.filter((standup) => standup.startedAt === 0),
			started: standups?.filter(
				(standup) => standup.startedAt !== 0 && standup.finishedAt === 0,
			),
			finished: standups
				?.filter((standup) => standup.finishedAt !== 0)
				.toSorted((a, b) => b.finishedAt - a.finishedAt),
		};
	}, [standups]);
	return (
		<>
			<div className="flex flex-col gap-y-8">
				<div className="flex flex-col gap-y-2">
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold">Stand-ups</h2>
						<Button variant="subtle" onClick={() => setOpen(true)}>
							Create stand-up
						</Button>
					</div>
					{created?.length === 0 && started?.length === 0 && (
						<Alert color="gray">
							<p>
								You don't have any stand-ups today. You can create a new
								stand-up by clicking the button on the top right corner.
							</p>
						</Alert>
					)}

					{created?.map((standup) => (
						<Card key={standup._id} withBorder radius="md">
							<div className="flex justify-between">
								<div className="flex items-center gap-x-4">
									<Avatar size="lg">{standup.emoji}</Avatar>
									<div className="flex flex-col gap-y-0.5 justify-between">
										<p className="text-base font-semibold">{standup.name}</p>
										<p className="text-sm ">{standup.description}</p>
									</div>
								</div>
								<div className="flex items-center gap-x-4">
									<Link to="/$standupId" params={{ standupId: standup._id }}>
										<Button
											variant="light"
											size="md"
											onClick={async () => {
												if (!user) return;
												await joinStandup({
													standupId: standup._id,
													userId: user._id,
												});
												throw redirect({
													to: '/$standupId',
													params: { standupId: standup._id },
												});
											}}
										>
											Join
										</Button>
									</Link>
									<Popover>
										<Popover.Target>
											<ActionIcon variant="subtle" color="red" size="input-md">
												<Trash2 />
											</ActionIcon>
										</Popover.Target>
										<Popover.Dropdown>
											<p className="text-sm">
												Are you sure you want to delete this stand-up?
											</p>
											<Button
												variant="light"
												color="red"
												size="xs"
												className="mt-2"
												onClick={() => deleteStandup({ id: standup._id })}
											>
												Delete
											</Button>
										</Popover.Dropdown>
									</Popover>
								</div>
							</div>
						</Card>
					))}
					{started?.map((standup) => (
						<Card key={standup._id} withBorder radius="md">
							<div className="flex justify-between">
								<div className="flex items-center gap-x-4">
									<Avatar size="lg">{standup.emoji}</Avatar>
									<div className="flex flex-col gap-y-0.5 justify-between">
										<p className="text-base font-semibold">{standup.name}</p>
										<p className="text-sm ">{standup.description}</p>
									</div>
								</div>
								<div className="flex items-center gap-x-4">
									<Link to="/$standupId" params={{ standupId: standup._id }}>
										<Button variant="light" size="md">
											View
										</Button>
									</Link>
								</div>
							</div>
						</Card>
					))}
				</div>

				{(userStats.totalStandupsCount > 0 ||
					userStats.totalUpdatesCount > 0) && (
					<div className="flex flex-col gap-y-2">
						<h2 className="text-2xl font-semibold">Your Statistics</h2>
						<div className="grid grid-cols-4 gap-4">
							<Card withBorder radius="md" className="p-4">
								<div className="text-center">
									<p className="text-2xl font-bold">
										{formatDuration(userStats.avgStandupDuration)}
									</p>
									<p className="text-sm text-gray-600">Avg Standup Duration</p>
								</div>
							</Card>
							{userStats.slowestUpdate > 0 && (
								<Card withBorder radius="md" className="p-4">
									<div className="text-center">
										<p className="text-2xl font-bold">
											{formatDuration(userStats.slowestUpdate)}
										</p>
										<p className="text-sm text-gray-600">Slowest Update</p>
									</div>
								</Card>
							)}
							<Card withBorder radius="md" className="p-4">
								<div className="text-center">
									<p className="text-2xl font-bold">
										{userStats.totalStandupsCount}
									</p>
									<p className="text-sm text-gray-600">Total Standups</p>
								</div>
							</Card>
							<Card withBorder radius="md" className="p-4">
								<div className="text-center">
									<p className="text-2xl font-bold">
										{formatDuration(userStats.avgUserUpdateDuration)}
									</p>
									<p className="text-sm text-gray-600">Avg Update Duration</p>
								</div>
							</Card>
						</div>
					</div>
				)}

				{finished?.length !== 0 && (
					<div className="flex flex-col gap-y-2">
						<h2 className="text-2xl font-semibold">Recent Stand-ups</h2>
						<div className="flex flex-col gap-y-4">
							{finished?.map((standup) => (
								<Card key={standup._id} withBorder radius="md">
									<div className="flex justify-between">
										<div className="flex items-center gap-x-4">
											<Avatar size="lg">{standup.emoji}</Avatar>
											<div className="flex flex-col gap-y-0.5 justify-between">
												<p className="text-base font-semibold">
													{standup.name}
												</p>
												<p className="text-sm ">{standup.description}</p>
											</div>
										</div>
										<div className="flex items-center gap-x-4">
											<Link
												to="/$standupId"
												params={{ standupId: standup._id }}
											>
												<Button variant="light" size="md">
													View
												</Button>
											</Link>
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>
				)}
			</div>
			<Modal
				opened={open}
				onClose={() => setOpen(false)}
				title="Create stand-up"
				overlayProps={{
					backgroundOpacity: 0.25,
					blur: 3,
				}}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					className="flex flex-col gap-y-4"
				>
					<Field
						name="name"
						children={({ state, handleChange, handleBlur }) => (
							<TextInput
								defaultValue={state.value}
								onChange={(e) => handleChange(e.target.value)}
								onBlur={handleBlur}
								placeholder="Enter the stand-up name"
							/>
						)}
					/>
					<Field
						name="description"
						children={({ state, handleChange, handleBlur }) => (
							<TextInput
								defaultValue={state.value}
								onChange={(e) => handleChange(e.target.value)}
								onBlur={handleBlur}
								placeholder="Enter the stand-up description"
							/>
						)}
					/>

					<Button type="submit" loading={isCreatingStandup}>
						Create
					</Button>
				</form>
			</Modal>
		</>
	);
};
