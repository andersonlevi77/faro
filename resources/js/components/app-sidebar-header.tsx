import { Breadcrumbs } from '@/components/breadcrumbs';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border bg-background/95 px-4 backdrop-blur-[6px] transition-[width,height] ease-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-5">
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <IconActionTooltip label="Mostrar u ocultar menú lateral">
                    <SidebarTrigger className="-ml-1 size-8 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
                </IconActionTooltip>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
