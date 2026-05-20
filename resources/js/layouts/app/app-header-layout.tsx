import { AppContent } from '@/components/app-content';
import { AppFlashMessages } from '@/components/app-flash-messages';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent variant="header">
                <AppFlashMessages />
                {children}
            </AppContent>
        </AppShell>
    );
}
