import { formatDuration } from '@/utils/helpers';
import { Badge, type BadgeProps } from '@mantine/core';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
	startedAt: number;
	showIcon?: boolean;
} & BadgeProps;

export const Timer = ({ startedAt, showIcon = true, ...props }: Props) => {
	const [elapsedTime, setElapsedTime] = useState(0);

	useEffect(() => {
		const updateElapsedTime = () => {
			const now = Date.now();
			setElapsedTime(Math.max(0, now - startedAt));
		};
		updateElapsedTime();
		const interval = setInterval(updateElapsedTime, 1000);
		return () => clearInterval(interval);
	}, [startedAt]);

	return (
		<Badge {...props}>
			{showIcon && <Clock size={props.size === 'md' ? 14 : 16} />}
			{formatDuration(elapsedTime)}
		</Badge>
	);
};
