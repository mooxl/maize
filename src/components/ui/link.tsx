import { composeTailwindRenderProps } from '@/utils/primitive';
import { type LinkComponent, createLink } from '@tanstack/react-router';
import {
	Link as LinkPrimitive,
	type LinkProps as LinkPrimitiveProps,
	type LinkRenderProps,
} from 'react-aria-components';
import { twJoin } from 'tailwind-merge';

interface LinkProps extends Omit<LinkPrimitiveProps, 'href'> {
	intent?: 'primary' | 'secondary' | 'unstyled';
	ref?: React.RefObject<HTMLAnchorElement>;
	children?:
		| React.ReactNode
		| ((
				values: LinkRenderProps & { defaultChildren: React.ReactNode },
		  ) => React.ReactNode);
}

const IntentLink = ({
	className,
	ref,
	intent = 'unstyled',
	...props
}: LinkProps) => {
	return (
		<LinkPrimitive
			ref={ref}
			{...props}
			className={composeTailwindRenderProps(
				className,
				twJoin([
					'outline-0 outline-offset-2 transition-[color,_opacity] focus-visible:outline-2 focus-visible:outline-ring forced-colors:outline-[Highlight]',
					'disabled:cursor-default disabled:opacity-60 forced-colors:disabled:text-[GrayText]',
					intent === 'unstyled' && 'text-current',
					intent === 'primary' && 'text-primary hover:underline',
					intent === 'secondary' && 'text-secondary-fg hover:underline',
				]),
			)}
		>
			{(values) => (
				<>
					{typeof props.children === 'function'
						? props.children(values)
						: props.children}
				</>
			)}
		</LinkPrimitive>
	);
};

const TanstackLink = createLink(IntentLink);

const Link: LinkComponent<typeof IntentLink> = (props) => (
	<TanstackLink {...props} />
);

export { Link };
export type { LinkProps };
