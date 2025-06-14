import type {
	Auth0ContextInterface,
	User as Auth0User,
} from '@auth0/auth0-react';
import { Avatar, Button, Divider, Popover } from '@mantine/core';
import type { QueryClient } from '@tanstack/react-query';
import {
	Link,
	Outlet,
	createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { User } from '../schemas/user';

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	auth: Auth0ContextInterface<Auth0User> | undefined;
	user: User | undefined;
}>()({
	component: () => <Root />,
});

const Root = () => {
	const { user, auth } = Route.useRouteContext();
	return (
		<>
			<nav className="bg-gray-50 h-14">
				<div className="container flex items-center justify-between relative h-full">
					<Link to="/">
						<p className="flex items-center text-2xl font-bold">🌽 maize</p>
					</Link>
					<Popover position="bottom" shadow="md">
						<Popover.Target>
							<Avatar src={user?.picture} />
						</Popover.Target>
						<Popover.Dropdown>
							<Button variant="light" size="sm" onClick={() => auth?.logout()}>
								Logout
							</Button>
						</Popover.Dropdown>
					</Popover>
				</div>
				<Divider orientation="horizontal" />
			</nav>
			<main className="overflow-y-auto h-[calc(100vh-3.5rem)]">
				<div className="container py-8">
					<Outlet />
				</div>
			</main>
			<TanStackRouterDevtools position="bottom-right" />
		</>
	);
};
