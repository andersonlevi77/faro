import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

type Props = {
    className?: string;
};

export default function AuthThemeToggle({ className }: Props) {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const isDark = resolvedAppearance === 'dark';

    return (
        <IconActionTooltip label={isDark ? 'Usar tema claro' : 'Usar tema oscuro'}>
            <button
                type="button"
                onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
                className={cn(
                    'flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors',
                    'hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    className,
                )}
                aria-label={isDark ? 'Usar tema claro' : 'Usar tema oscuro'}
            >
                {isDark ? (
                    <Sun className="size-4" aria-hidden />
                ) : (
                    <Moon className="size-4" aria-hidden />
                )}
            </button>
        </IconActionTooltip>
    );
}
