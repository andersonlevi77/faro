import type { PropsWithChildren } from 'react';
import { AppBrandLogo } from '@/components/app-brand-logo';
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
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-canvas p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <AppBrandLogo variant="auth" href={home()} className="self-center" showAppText={false} />

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
