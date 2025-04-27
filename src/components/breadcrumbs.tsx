import {
	BreadcrumbsItem,
	Breadcrumbs as BreadcrumbsPrimitive,
} from '@/components/ui/breadcrumbs';
import { navigationMap } from '@/utils/constants';
import { useRouterState } from '@tanstack/react-router';
import { Link } from './ui/link';

export const Breadcrumbs = () => {
	const { matches } = useRouterState();

	return (
		<BreadcrumbsPrimitive>
			{matches.map((match) => {
				if (match.routeId === '/' || match.routeId.endsWith('/')) {
					return null;
				}
				return (
					<BreadcrumbsItem key={match.id}>
						<Link to={match.pathname}>
							{navigationMap[match.fullPath].label}
						</Link>
					</BreadcrumbsItem>
				);
			})}
		</BreadcrumbsPrimitive>
	);
};
