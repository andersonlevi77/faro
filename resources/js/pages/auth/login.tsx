import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <AuthLayout>
            <Head title="Iniciar sesión" />

            {status && (
                <p className="mb-4 text-center text-sm text-success">{status}</p>
            )}

            <Form {...store.form()} resetOnSuccess={['password']} className="w-full space-y-5">
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="nombre@empresa.com"
                                className="faro-auth-input"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                    Contraseña
                                </Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                        tabIndex={5}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </TextLink>
                                )}
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="faro-auth-input"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox id="remember" name="remember" tabIndex={3} />
                            <Label htmlFor="remember" className="text-sm font-normal text-foreground">
                                Recordar
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="h-11 w-full rounded-lg bg-foreground text-background hover:bg-foreground/90"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing && <Spinner />}
                            Iniciar sesión
                        </Button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
