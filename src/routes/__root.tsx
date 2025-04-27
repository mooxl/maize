import { Breadcrumbs } from '@/components/breadcrumbs';
import { Separator } from '@/components/ui/separator';
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarInset,
	SidebarItem,
	SidebarLabel,
	SidebarNav,
	SidebarProvider,
	SidebarRail,
	SidebarSection,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { UserSwitcher } from '@/components/user-switcher';
import { navigationMap } from '@/utils/constants';
import type { QueryClient } from '@tanstack/react-query';
import type { ToOptions } from '@tanstack/react-router';
import {
	Outlet,
	createRootRouteWithContext,
	useRouter,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { RouterProvider } from 'react-aria-components';

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => <Root />,
});

const Root = () => {
	const router = useRouter();
	return (
		<RouterProvider
			navigate={(to, options) => router.navigate({ to, ...options })}
			useHref={(to) => router.buildLocation({ to }).href}
		>
			<SidebarProvider defaultOpen={false}>
				<Sidebar collapsible="dock" intent="inset">
					<SidebarHeader>
						<div className="flex items-center gap-x-2 group-data-[collapsible=dock]:size-10 group-data-[collapsible=dock]:justify-center">
							🌽<SidebarLabel className="font-medium">maize</SidebarLabel>
						</div>
					</SidebarHeader>
					<SidebarContent>
						<SidebarSection>
							{Object.entries(navigationMap).map(([to, item]) => (
								<SidebarItem
									key={item.id}
									href={to as ToOptions['to']}
									tooltip={item.label}
								>
									{item.icon}
									<SidebarLabel>{item.label}</SidebarLabel>
								</SidebarItem>
							))}
						</SidebarSection>
						<SidebarSection>
							<UserSwitcher />
						</SidebarSection>
					</SidebarContent>
					<SidebarRail />
				</Sidebar>
				<SidebarInset>
					<SidebarNav className="border-b">
						<span className="flex items-center gap-x-4">
							<SidebarTrigger className="-mx-2" />
							<Separator className="h-6" orientation="vertical" />
							<Breadcrumbs />
						</span>
					</SidebarNav>
					<main className="py-8 px-14 h-full">
						<Outlet />
						<TanStackRouterDevtools position="bottom-right" />
					</main>
				</SidebarInset>
			</SidebarProvider>
		</RouterProvider>
	);
};
