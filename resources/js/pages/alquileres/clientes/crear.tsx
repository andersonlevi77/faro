import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { IconActionTooltip } from '@/components/icon-action-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { create, index, store } from '@/routes/clientes';
import type { BreadcrumbItem } from '@/types';

export default function ClientesCrear() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Clientes', href: index.url() },
        { title: 'Nuevo', href: create.url() },
    ];

    const { data, setData, post, processing, errors } = useForm({
        codigo: '',
        nombre: '',
        documento: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        notas: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo cliente" />
            <div className="faro-page">
                <div className="flex items-center gap-3">
                    <IconActionTooltip label="Volver a la lista de clientes">
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-muted" asChild>
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                    </IconActionTooltip>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">Nuevo cliente</h1>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="faro-form-card space-y-5"
                >
                    <div className="faro-form-grid sm:grid-cols-2">
                        <div className="faro-field">
                            <Label htmlFor="codigo">Código</Label>
                            <Input
                                id="codigo"
                                placeholder="Opcional"
                                value={data.codigo}
                                onChange={(e) => setData('codigo', e.target.value)}
                            />
                            <InputError message={errors.codigo} />
                        </div>
                        <div className="faro-field sm:col-span-2">
                            <Label htmlFor="nombre">Nombre o razón social *</Label>
                            <Input id="nombre" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} required />
                            <InputError message={errors.nombre} />
                        </div>
                        <div className="faro-field">
                            <Label htmlFor="documento">Documento (NIT / CI)</Label>
                            <Input id="documento" value={data.documento} onChange={(e) => setData('documento', e.target.value)} />
                            <InputError message={errors.documento} />
                        </div>
                        <div className="faro-field">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            <InputError message={errors.email} />
                        </div>
                        <div className="faro-field">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input
                                id="telefono"
                                inputMode="numeric"
                                maxLength={8}
                                pattern="\d{8}"
                                placeholder="12345678"
                                value={data.telefono}
                                onChange={(e) => setData('telefono', e.target.value.replace(/\D/g, '').slice(0, 8))}
                            />
                            <InputError message={errors.telefono} />
                        </div>
                        <div className="faro-field">
                            <Label htmlFor="ciudad">Ciudad</Label>
                            <Input id="ciudad" value={data.ciudad} onChange={(e) => setData('ciudad', e.target.value)} />
                            <InputError message={errors.ciudad} />
                        </div>
                        <div className="faro-field sm:col-span-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input id="direccion" value={data.direccion} onChange={(e) => setData('direccion', e.target.value)} />
                            <InputError message={errors.direccion} />
                        </div>
                        <div className="faro-field sm:col-span-2">
                            <Label htmlFor="notas">Notas</Label>
                            <Input id="notas" value={data.notas} onChange={(e) => setData('notas', e.target.value)} />
                            <InputError message={errors.notas} />
                        </div>
                    </div>
                    <div className="faro-form-actions">
                        <Button type="submit" variant="success" disabled={processing} className="faro-btn-primary">
                            Guardar
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
