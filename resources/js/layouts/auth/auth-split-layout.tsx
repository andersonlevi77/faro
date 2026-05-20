import { Link, usePage } from '@inertiajs/react';
import { Headphones, Moon } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import AuthThemeToggle from '@/components/auth-theme-toggle';
import { TooltipProvider } from '@/components/ui/tooltip';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props as { name?: string };
    return (
        <TooltipProvider delayDuration={400}>
        <div className="grid min-h-dvh lg:grid-cols-2">
            {/* Left: form */}
            <div className="relative flex flex-col justify-center px-6 py-10 md:px-12 lg:px-16">
                <div className="absolute right-4 top-4 md:right-6 md:top-6 lg:right-8 lg:top-8">
                    <AuthThemeToggle />
                </div>

                <div className="mx-auto w-full max-w-[380px]">
                    <Link
                        href={home()}
                        className="mb-8 inline-flex items-center gap-2 text-foreground"
                    >
                        <AppLogoIcon className="size-8 fill-current opacity-90" />
                        <span className="text-lg font-semibold">
                            {name ?? 'Faro'}
                        </span>
                    </Link>

                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {title}
                    </h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        {description}
                    </p>

                    <div className="mt-8 [&_.auth-accent]:text-foreground [&_.auth-accent]:underline [&_.auth-accent]:decoration-primary/40 [&_.auth-accent]:hover:decoration-primary [&_button[type=submit]]:bg-primary [&_button[type=submit]]:text-primary-foreground [&_button[type=submit]]:hover:bg-primary/90 [&_button[type=submit]]:focus-visible:ring-ring">
                        {children}
                    </div>
                </div>
            </div>

            {/* Right: panel — azul/cian */}
            <div className="relative hidden overflow-hidden bg-sky-700 lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-600/95 to-cyan-800" />

                <div className="relative flex h-full flex-col p-10 text-white">
                    <div className="flex justify-end">
                        <a
                            href="#"
                            className="flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
                        >
                            <Headphones className="size-4" aria-hidden />
                            Support
                        </a>
                    </div>

                    <div className="mt-12 flex flex-1 flex-col gap-8">
                        {/* Main card */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h2 className="text-lg font-semibold text-white">
                                Reach your goals faster
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-white/80">
                                Use your tools from anywhere with no friction.
                                Organize, track and move forward.
                            </p>
                            <div className="relative mt-6 min-h-[140px]">
                                <img
                                    src="/images/auth-hero.svg"
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-contain object-left"
                                />
                            </div>
                            <button
                                type="button"
                                className="mt-4 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                            >
                                Learn more
                            </button>
                        </div>

                        {/* Metric card */}
                        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-md bg-white/10">
                                    <svg
                                        className="size-4 text-white/90"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-white/90">
                                    Progress
                                </span>
                                <span className="ml-auto text-sm font-semibold text-white">
                                    Ready
                                </span>
                            </div>
                        </div>

                        {/* Feature text */}
                        <div>
                            <h3 className="text-base font-semibold text-white">
                                Introducing new features
                            </h3>
                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/75">
                                Analyzing previous trends ensures that you always
                                make the right decision. As the scale of your
                                work grows, small improvements compound.
                            </p>
                        </div>
                    </div>

                    {/* Bottom: dots + theme hint */}
                    <div className="mt-auto flex items-center justify-between pt-8">
                        <div className="flex gap-1.5">
                            <span className="size-2 rounded-full bg-white/40" />
                            <span className="size-2 rounded-full bg-white/20" />
                            <span className="size-2 rounded-full bg-white/20" />
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-white/50">
                            <Moon className="size-3.5" aria-hidden />
                            Dark panel
                        </span>
                    </div>
                </div>
            </div>
        </div>
        </TooltipProvider>
    );
}
