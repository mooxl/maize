import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import {
	ConvexQueryClient,
	convexQuery,
	useConvexMutation,
} from '@convex-dev/react-query';
import {
	type MantineColorsTuple,
	MantineProvider,
	createTheme,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import {
	QueryClient,
	QueryClientProvider,
	useMutation,
	useQuery,
} from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithAuth0 } from 'convex/react-auth0';
import { StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { api } from '../convex/_generated/api';
import './global.css';
import { routeTree } from './routeTree.gen';

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
		auth: undefined,
		user: undefined,
	},
	defaultPreload: 'intent',
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

const getMeQuery = (email: string) =>
	convexQuery(api.user.getByEmail, {
		email,
	});

const App = () => {
	const { mutate: storeUser } = useMutation({
		mutationFn: useConvexMutation(api.user.store),
	});
	const auth = useAuth0();

	useEffect(() => {
		if (auth.user) {
			storeUser({
				name: auth.user.name ?? '',
				email: auth.user.email ?? '',
				picture: auth.user.picture ?? '',
			});
		}
	}, [auth.user, storeUser]);

	const { data: user } = useQuery({
		...getMeQuery(auth.user?.email ?? ''),
		enabled: auth.isAuthenticated && auth.user !== undefined,
	});

	if (auth.isLoading) {
		return null;
	}
	if (!auth.isAuthenticated) {
		auth.loginWithRedirect();
	}
	if (!user) {
		return null;
	}
	return <RouterProvider router={router} context={{ auth, user }} />;
};

const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
	ReactDOM.createRoot(rootElement).render(
		<StrictMode>
			<Auth0Provider
				domain={import.meta.env.VITE_AUTH0_DOMAIN}
				clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
				useRefreshTokens={true}
				cacheLocation="localstorage"
				authorizationParams={{
					redirect_uri: window.location.origin,
				}}
			>
				<ConvexProviderWithAuth0 client={convex}>
					<QueryClientProvider client={queryClient}>
						<MantineProvider theme={theme}>
							<Notifications />
							<App />
						</MantineProvider>
					</QueryClientProvider>
				</ConvexProviderWithAuth0>
			</Auth0Provider>
		</StrictMode>,
	);
}

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
