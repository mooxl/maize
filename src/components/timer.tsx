import { formatDuration } from '@/utils/helpers';
import { Badge, type BadgeProps } from '@mantine/core';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
	startedAt: number;
	finishedAt?: number;
	showIcon?: boolean;
} & BadgeProps;

export const Timer = ({
	startedAt,
	finishedAt,
	showIcon = true,
	...props
}: Props) => {
	const [elapsedTime, setElapsedTime] = useState(0);
	useEffect(() => {
		const updateElapsedTime = () => {
			const now = finishedAt ? finishedAt : Date.now();
			setElapsedTime(Math.max(0, now - startedAt));
		};
		updateElapsedTime();
		const interval = setInterval(updateElapsedTime, 1000);
		return () => clearInterval(interval);
	}, [startedAt, finishedAt]);

	return (
		<Badge {...props}>
			{showIcon && <Clock size={props.size === 'md' ? 14 : 16} />}
			{formatDuration(elapsedTime)}
		</Badge>
	);
};
