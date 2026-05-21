import { AppBrandLogo } from '@/components/app-brand-logo';
import { dashboard } from '@/routes';

export default function AppLogo() {
    return (
        <AppBrandLogo
            variant="sidebar"
            href={dashboard.url()}
            showAppText
            className="group-data-[collapsible=icon]:[&_img]:h-8 group-data-[collapsible=icon]:[&_img]:max-w-none"
        />
    );
}
