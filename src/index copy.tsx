import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ComboBox } from '@/components/ui/combo-box';
import { TextField } from '@/components/ui/text-field';
import { userSchema } from '@/schemas/user';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery } from 'convex/react';
import { z } from 'zod';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';

export const Route = createFileRoute('/')({
	component: () => <Page />,
});

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		ComboBox,
	},
	formComponents: {
		Button,
	},
	fieldContext,
	formContext,
});

const Page = () => {
	const users = useQuery(api.user.get);
	const createUser = useMutation(api.user.create);

	const tasks = useQuery(api.task.get);
	const createTask = useMutation(api.task.create);

	const formUser = useAppForm({
		defaultValues: {
			name: '',
		},
		validators: {
			onChange: z.object({
				name: z.string().min(6, { error: 'must be at least 6 characters' }),
			}),
		},
		onSubmit: async (values) => {
			console.log('submit', values);
			await createUser({ name: values.value.name });
		},
	});

	const formTask = useAppForm({
		defaultValues: {
			userId: '' as Id<'user'> | '',
			text: '',
		},
		validators: {
			onChange: userSchema,
		},
		onSubmit: async (values) => {
			console.log('submit', values);
			await createTask({
				userId: values.value.userId as Id<'user'>,
				text: values.value.text,
			});
			formTask.reset();
		},
	});

	return (
		<>
			<div className="flex gap-x-5">
				<Card className="w-96 p-4">
					<form
						className="space-y-4"
						onSubmit={async (e) => {
							e.preventDefault();
							await formUser.handleSubmit();
							formUser.reset();
						}}
					>
						<formUser.AppField name="name">
							{(field) => {
								return (
									<field.TextField
										label={`Name ${field.state.meta.errors.length > 0 ? field.state.meta.errors[0]?.message : ''}`}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e)}
										errorMessage={
											field.state.meta.errors.length > 0
												? field.state.meta.errors[0]?.message
												: undefined
										}
									/>
								);
							}}
						</formUser.AppField>
						<formUser.AppForm>
							<formUser.Button type="submit">Create User</formUser.Button>
						</formUser.AppForm>
					</form>
				</Card>
				<div>
					{users?.map((user) => (
						<div key={user._id}>
							{user.name} - {user._id}
						</div>
					))}
				</div>
			</div>
			<div className="flex gap-x-5">
				<Card className="w-96 p-4">
					<form
						className="space-y-4"
						onSubmit={async (e) => {
							e.preventDefault();
							await formTask.handleSubmit();
							formTask.reset();
						}}
					>
						<formTask.AppField name="userId">
							{(field) => {
								return (
									<field.ComboBox
										label="User"
										selectedKey={field.state.value}
										onSelectionChange={(e) => {
											field.handleChange(e as Id<'user'>);
										}}
										onBlur={field.handleBlur}
									>
										<ComboBox.Input />
										<ComboBox.List items={users} selectionMode="single">
											{(user) => (
												<ComboBox.Option
													key={user._id}
													id={user._id}
													value={user._id as Id<'user'>}
												>
													{user.name}
												</ComboBox.Option>
											)}
										</ComboBox.List>
									</field.ComboBox>
								);
							}}
						</formTask.AppField>
						<formTask.AppField name="text">
							{(field) => {
								return (
									<field.TextField
										label="Text"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e)}
									/>
								);
							}}
						</formTask.AppField>
						<formTask.AppForm>
							<formTask.Button type="submit">Create Task</formTask.Button>
						</formTask.AppForm>
					</form>
				</Card>
				<div>
					{tasks?.map((task) => (
						<div key={task._id}>
							{task.text} -{' '}
							{users?.find((user) => user._id === task.userId)?.name}
						</div>
					))}
				</div>
			</div>
		</>
	);
};
