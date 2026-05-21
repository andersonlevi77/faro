import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Wand2 } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { create, index, store } from '@/routes/usuarios';
import type { BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
}

const CHARSET_CONTRASEÑA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*_-';

function generarContraseña(longitud = 20): string {
    const bytes = new Uint32Array(longitud);
    crypto.getRandomValues(bytes);
    let salida = '';
    for (let i = 0; i < longitud; i++) {
        salida += CHARSET_CONTRASEÑA[bytes[i]! % CHARSET_CONTRASEÑA.length];
    }
    return salida;
}

export default function UsuariosCrear({ roles }: { roles: Role[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuarios', href: index.url() },
        { title: 'Nuevo', href: create.url() },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[],
    });

    const toggleRole = (name: string) => {
        if (data.roles.includes(name)) {
            setData(
                'roles',
                data.roles.filter((r) => r !== name),
            );
        } else {
            setData('roles', [...data.roles, name]);
        }
    };

    const rellenarContraseñaAleatoria = () => {
        const p = generarContraseña();
        setData('password', p);
        setData('password_confirmation', p);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo usuario" />
            <div className="faro-page">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver a la lista de usuarios">
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">Nuevo usuario</h1>
                        <p className="text-sm text-muted-foreground">
                            Alta para colaboradores: define email, contraseña y roles. Copia la contraseña antes de
                            guardar si la generas automáticamente.
                        </p>
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="faro-form-card"
                >
                    <div className="faro-form-grid sm:grid-cols-2">
                        <div className="faro-field sm:col-span-2">
                            <Label htmlFor="name">Nombre completo *</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoComplete="name" />
                            <InputError message={errors.name} />
                        </div>
                        <div className="faro-field sm:col-span-2">
                            <Label htmlFor="email">Correo electrónico *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div className="faro-field">
                            <div className="flex min-h-8 flex-wrap items-end justify-between gap-2">
                                <Label htmlFor="password">Contraseña *</Label>
                                <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={rellenarContraseñaAleatoria}>
                                    <Wand2 className="size-3.5" />
                                    Generar contraseña
                                </Button>
                            </div>
                            <PasswordInput
                                id="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} />
                        </div>
                        <div className="faro-field">
                            <div className="flex min-h-8 items-end">
                                <Label htmlFor="password_confirmation">Confirmar contraseña *</Label>
                            </div>
                            <PasswordInput
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </div>
                    <div className="space-y-3 border-t border-border/40 pt-6">
                        <div>
                            <h2 className="text-base font-medium text-foreground">Roles</h2>
                            <p className="text-sm text-muted-foreground">Puedes dejarlo sin roles y asignarlos después desde la lista.</p>
                        </div>
                        <div className="faro-field">
                            {roles.map((r) => (
                                <label
                                    key={r.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 px-3 py-2 hover:bg-muted/30"
                                >
                                    <input
                                        type="checkbox"
                                        className="size-4 rounded border-input"
                                        checked={data.roles.includes(r.name)}
                                        onChange={() => toggleRole(r.name)}
                                    />
                                    <span className="text-sm font-medium capitalize">{r.name}</span>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.roles} />
                    </div>
                    <div className="faro-form-actions">
                        <Button type="submit" variant="success" disabled={processing} className="faro-btn-primary">
                            Crear usuario
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={index.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
