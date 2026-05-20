import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
    label: string;
    children: React.ReactElement;
    side?: 'top' | 'right' | 'bottom' | 'left';
};

/**
 * Tooltip para botones solo icono (acciones de tabla, volver, etc.).
 * Requiere `TooltipProvider` en un ancestro (p. ej. AppShell).
 */
export function IconActionTooltip({ label, children, side = 'top' }: Props) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side={side}>{label}</TooltipContent>
        </Tooltip>
    );
}
