import { composeTailwindRenderProps } from '@/utils/primitive';
import type { ToOptions } from '@tanstack/router-core';
import { ChevronRight } from 'lucide-react';
import { createContext, use } from 'react';
import type {
	BreadcrumbProps,
	BreadcrumbsProps,
	LinkProps,
} from 'react-aria-components';
import {
	Breadcrumb,
	Breadcrumbs as BreadcrumbsPrimitive,
} from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { Link } from './link';

type BreadcrumbsContextProps = { separator?: 'chevron' | 'slash' | boolean };
const BreadcrumbsProvider = createContext<BreadcrumbsContextProps>({
	separator: 'chevron',
});

const Breadcrumbs = <T extends object>({
	className,
	...props
}: BreadcrumbsProps<T> & BreadcrumbsContextProps) => {
	return (
		<BreadcrumbsProvider value={{ separator: props.separator }}>
			<BreadcrumbsPrimitive
				{...props}
				className={twMerge('flex items-center gap-2', className)}
			/>
		</BreadcrumbsProvider>
	);
};

interface BreadcrumbsItemProps
	extends BreadcrumbProps,
		BreadcrumbsContextProps {
	href?: ToOptions['to'];
}

const BreadcrumbsItem = ({
	href,
	separator = true,
	className,
	children,
	...props
}: BreadcrumbsItemProps &
	Partial<Omit<LinkProps, 'className' | 'children'>>) => {
	const { separator: contextSeparator } = use(BreadcrumbsProvider);
	separator = contextSeparator ?? separator;
	const separatorValue = separator === true ? 'chevron' : separator;

	return (
		<Breadcrumb
			{...props}
			className={composeTailwindRenderProps(
				className,
				'flex items-center gap-2 text-sm',
			)}
		>
			{({ isCurrent }) => (
				<>
					<Link to={href}>
						{typeof children === 'function'
							? children({
									isCurrent,
									isDisabled: false,
									defaultChildren: null,
								})
							: children}
					</Link>
					{!isCurrent && separator !== false && (
						<Separator separator={separatorValue} />
					)}
				</>
			)}
		</Breadcrumb>
	);
};

const Separator = ({
	separator = 'chevron',
}: { separator?: BreadcrumbsItemProps['separator'] }) => {
	return (
		<span className="*:shrink-0 *:text-muted-fg *:data-[slot=icon]:size-3.5">
			{separator === 'chevron' && <ChevronRight data-slot="icon" />}
			{separator === 'slash' && <span className="text-muted-fg">/</span>}
		</span>
	);
};

Breadcrumbs.Item = BreadcrumbsItem;

export { Breadcrumbs, BreadcrumbsItem };
export type { BreadcrumbsItemProps, BreadcrumbsProps };
