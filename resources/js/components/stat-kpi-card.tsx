import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatKpiCardProps = {
    label: string;
    value: string | number;
    hint?: string;
    icon: LucideIcon;
    iconClassName?: string;
    iconBgClassName?: string;
    valueClassName?: string;
};

export function StatKpiCard({
    label,
    value,
    hint,
    icon: Icon,
    iconClassName = 'text-primary',
    iconBgClassName = 'bg-primary/10',
    valueClassName,
}: StatKpiCardProps) {
    return (
        <Card className="gap-0 py-5">
            <CardContent className="flex flex-col gap-3 px-5">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {label}
                    </p>
                    <span
                        className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-xl',
                            iconBgClassName,
                        )}
                    >
                        <Icon className={cn('size-5', iconClassName)} />
                    </span>
                </div>
                <p className={cn('text-3xl font-bold tracking-tight tabular-nums', valueClassName)}>
                    {value}
                </p>
                {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            </CardContent>
        </Card>
    );
}
