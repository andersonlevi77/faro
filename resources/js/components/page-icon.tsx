import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type PageIconProps = {
    icon: LucideIcon;
    className?: string;
    iconClassName?: string;
};

export function PageIcon({ icon: Icon, className, iconClassName }: PageIconProps) {
    return (
        <span className={cn('faro-page-icon', className)}>
            <Icon className={cn('size-[18px]', iconClassName)} />
        </span>
    );
}
