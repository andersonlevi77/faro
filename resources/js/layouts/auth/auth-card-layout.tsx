import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    const { name } = usePage().props as { name?: string };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-canvas p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex flex-col items-center gap-2 self-center"
                >
                    <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-card">
                        <AppLogoIcon className="size-6 fill-current text-white" />
                    </div>
                    <span className="text-lg font-bold text-primary">{name ?? 'Faro'}</span>
                </Link>

                <Card className="rounded-2xl border-0 py-0 shadow-card">
                    <CardHeader className="px-8 pt-8 pb-0 text-center md:px-10">
                        <CardTitle className="text-xl font-bold">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 py-8 md:px-10">{children}</CardContent>
                </Card>
            </div>
        </div>
    );
}
