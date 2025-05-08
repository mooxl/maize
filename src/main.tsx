import { ConvexQueryClient } from '@convex-dev/react-query';
import {
	type MantineColorsTuple,
	MantineProvider,
	createTheme,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	type NavigateOptions,
	RouterProvider,
	type ToOptions,
	createRouter,
} from '@tanstack/react-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useAtomValue } from 'jotai/react';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from './components/ui/button';
import { ComboBox } from './components/ui/combo-box';
import { TextField } from './components/ui/text-field';
import './global.css';
import { routeTree } from './routeTree.gen';
import { userAtom } from './states/user';

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

const myColor: MantineColorsTuple = [
	'oklch(0.977 0.013 236.62)',
	'oklch(0.951 0.026 236.824)',
	'oklch(0.901 0.058 230.902)',
	'oklch(0.828 0.111 230.318)',
	'oklch(0.746 0.16 232.661)',
	'oklch(0.685 0.169 237.323)',
	'oklch(0.588 0.158 241.966)',
	'oklch(0.5 0.134 242.749)',
	'oklch(0.443 0.11 240.79)',
	'oklch(0.391 0.09 240.876)',
	'oklch(0.293 0.066 243.157)',
];

const theme = createTheme({
	colors: {
		myColor,
	},
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
		user: null,
	},
	defaultPreload: 'intent',
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

const App = () => {
	const user = useAtomValue(userAtom);
	return (
		<ConvexProvider client={convex}>
			<QueryClientProvider client={queryClient}>
				<MantineProvider theme={theme}>
					<RouterProvider router={router} context={{ user }} />
				</MantineProvider>
			</QueryClientProvider>
		</ConvexProvider>
	);
};

const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
	ReactDOM.createRoot(rootElement).render(
		<StrictMode>
			<App />
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
