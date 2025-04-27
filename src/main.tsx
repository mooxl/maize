import { ConvexQueryClient } from '@convex-dev/react-query';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	type NavigateOptions,
	RouterProvider,
	type ToOptions,
	createRouter,
} from '@tanstack/react-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { StrictMode } from 'react';
import {} from 'react-aria-components';
import ReactDOM from 'react-dom/client';
import { Button } from './components/ui/button';
import { ComboBox } from './components/ui/combo-box';
import { TextField } from './components/ui/text-field';
import './global.css';
import { routeTree } from './routeTree.gen';

export const { fieldContext, formContext } = createFormHookContexts();

export const { useAppForm } = createFormHook({
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

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: convexQueryClient.hashFn(),
			queryFn: convexQueryClient.queryFn(),
		},
	},
});
convexQueryClient.connect(queryClient);

const router = createRouter({
	routeTree,
	context: {
		queryClient,
	},
	defaultPreload: 'intent',
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
	ReactDOM.createRoot(rootElement).render(
		<StrictMode>
			<ConvexProvider client={convex}>
				<QueryClientProvider client={queryClient}>
					<RouterProvider router={router} />
				</QueryClientProvider>
			</ConvexProvider>
		</StrictMode>,
	);
}

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
declare module 'react-aria-components' {
	interface RouterConfig {
		href: ToOptions['to'];
		routerOptions: Omit<NavigateOptions, keyof ToOptions>;
	}
}
