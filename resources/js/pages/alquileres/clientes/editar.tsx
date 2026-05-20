import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { edit, index, update } from '@/routes/clientes';
import type { BreadcrumbItem } from '@/types';

interface Cliente {
    id: number;
    nombre: string;
    documento: string | null;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    ciudad: string | null;
    notas: string | null;
}

export default function ClientesEditar({ cliente }: { cliente: Cliente }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Clientes', href: index.url() },
        { title: cliente.nombre, href: edit.url({ cliente: cliente.id }) },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nombre: cliente.nombre,
        documento: cliente.documento ?? '',
        email: cliente.email ?? '',
        telefono: cliente.telefono ?? '',
        direccion: cliente.direccion ?? '',
        ciudad: cliente.ciudad ?? '',
        notas: cliente.notas ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url({ cliente: cliente.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar: ${cliente.nombre}`} />
            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-5">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver a la lista de clientes">
                        <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-accent" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">Editar cliente</h1>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="w-full space-y-5 rounded-xl bg-card p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input id="nombre" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} required />
                            <InputError message={errors.nombre} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="documento">Documento</Label>
                            <Input id="documento" value={data.documento} onChange={(e) => setData('documento', e.target.value)} />
                            <InputError message={errors.documento} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            <InputError message={errors.email} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input id="telefono" value={data.telefono} onChange={(e) => setData('telefono', e.target.value)} />
                            <InputError message={errors.telefono} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ciudad">Ciudad</Label>
                            <Input id="ciudad" value={data.ciudad} onChange={(e) => setData('ciudad', e.target.value)} />
                            <InputError message={errors.ciudad} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input id="direccion" value={data.direccion} onChange={(e) => setData('direccion', e.target.value)} />
                            <InputError message={errors.direccion} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="notas">Notas</Label>
                            <Input id="notas" value={data.notas} onChange={(e) => setData('notas', e.target.value)} />
                            <InputError message={errors.notas} />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            Guardar cambios
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
