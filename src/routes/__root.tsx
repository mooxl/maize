import { UserSwitcher } from '@/components/user-switcher';
import type { User } from '@/schemas/user';
import { Divider, Tabs } from '@mantine/core';
import type { QueryClient } from '@tanstack/react-query';
import {
	Link,
	Outlet,
	type ToOptions,
	createRootRouteWithContext,
	useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	user: User | null;
}>()({
	component: () => <Root />,
});

const navItems: { label: string; to: NonNullable<ToOptions['to']> }[] = [
	{
		label: 'Home',
		to: '/',
	},
	{
		label: 'Standups',
		to: '/standups',
	},
];

const Navigation = () => {
	const location = useRouterState({ select: (s) => s.location.pathname });
	return (
		<nav className="bg-gray-50 fixed top-0 left-0 right-0 z-10">
			<div className="container flex items-center justify-between relative">
				<p className="h-14 flex items-center text-2xl font-bold">🌽 maize</p>
				<div className="self-end ">
					<Tabs
						variant="outline"
						orientation="horizontal"
						classNames={{
							tab: 'top-[1px] data-[active=true]:bg-white! data-[active=true]:border-b-white! px-8! border-gray-200! bg-gray-100!',
							tabSection: 'border-none!',
						}}
						value={location}
					>
						<div className="flex gap-x-2">
							{navItems.map((item) => (
								<Link key={item.to} to={item.to}>
									<Tabs.Tab value={item.to}>{item.label}</Tabs.Tab>
								</Link>
							))}
						</div>
					</Tabs>
				</div>
				<UserSwitcher />
			</div>
			<Divider orientation="horizontal" />
		</nav>
	);
};

const Root = () => {
	return (
		<>
			<Navigation />
			<Divider orientation="vertical" />
			<main className="container mt-20">
				<Outlet />
			</main>
			<TanStackRouterDevtools position="bottom-right" />
		</>
	);
};
