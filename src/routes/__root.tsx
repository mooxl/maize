import { UserSwitcher } from '@/components/user-switcher';
import type { User } from '@/schemas/user';
import { ActionIcon, Divider, ScrollArea } from '@mantine/core';
import type { QueryClient } from '@tanstack/react-query';
import {
	Link,
	Outlet,
	createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	user: User | null;
}>()({
	component: () => <Root />,
});

const Root = () => {
	return (
		<main className="h-screen w-screen flex">
			<nav className="flex flex-col justify-between p-4">
				<Link to="/">
					<ActionIcon
						variant="subtle"
						size="input-xl"
						classNames={{
							root: 'p-2',
							icon: 'text-3xl',
						}}
					>
						🌽
					</ActionIcon>
				</Link>
				<UserSwitcher />
			</nav>
			<Divider orientation="vertical" />
			<ScrollArea className="py-8 px-14 h-full w-full">
				<Outlet />
				<TanStackRouterDevtools position="bottom-right" />
			</ScrollArea>
		</main>
	);
};
