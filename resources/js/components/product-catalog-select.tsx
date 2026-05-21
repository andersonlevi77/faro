import { Plus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PostJsonError, postJson } from '@/lib/post-json';
import { store as storeCategoria } from '@/routes/categorias';
import { store as storeMarca } from '@/routes/marcas';
import { store as storePresentacion } from '@/routes/presentaciones';

const CREATE_VALUE = '__create__';

export interface CatalogOption {
    id: number;
    nombre: string;
}

type CatalogKind = 'categoria' | 'marca' | 'presentacion';

const catalogConfig: Record<
    CatalogKind,
    {
        createLabel: string;
        dialogTitle: string;
        placeholder: string;
        storeUrl: () => string;
    }
> = {
    categoria: {
        createLabel: 'Crear categoría…',
        dialogTitle: 'Nueva categoría',
        placeholder: 'Ej. Andamios y escaleras',
        storeUrl: storeCategoria.url,
    },
    marca: {
        createLabel: 'Crear marca…',
        dialogTitle: 'Nueva marca',
        placeholder: 'Ej. Genérico',
        storeUrl: storeMarca.url,
    },
    presentacion: {
        createLabel: 'Crear presentación…',
        dialogTitle: 'Nueva presentación',
        placeholder: 'Ej. Unidad',
        storeUrl: storePresentacion.url,
    },
};

type ProductCatalogSelectProps = {
    label: string;
    kind: CatalogKind;
    value: number | '';
    onValueChange: (id: number | '') => void;
    options: CatalogOption[];
    onOptionsChange: (options: CatalogOption[]) => void;
    error?: string;
};

export function ProductCatalogSelect({
    label,
    kind,
    value,
    onValueChange,
    options,
    onOptionsChange,
    error,
}: ProductCatalogSelectProps) {
    const config = catalogConfig[kind];
    const [dialogOpen, setDialogOpen] = useState(false);
    const [nombre, setNombre] = useState('');
    const [saving, setSaving] = useState(false);
    const [createError, setCreateError] = useState<string | undefined>();

    const openCreateDialog = () => {
        setNombre('');
        setCreateError(undefined);
        setDialogOpen(true);
    };

    const handleSelectChange = (selected: string) => {
        if (selected === CREATE_VALUE) {
            openCreateDialog();

            return;
        }

        onValueChange(selected ? Number(selected) : '');
    };

    const handleCreate = async () => {
        const trimmed = nombre.trim();

        if (!trimmed) {
            setCreateError('El nombre es obligatorio.');

            return;
        }

        setSaving(true);
        setCreateError(undefined);

        try {
            const created = await postJson<CatalogOption>(config.storeUrl(), { nombre: trimmed });
            const nextOptions = [...options, created].sort((a, b) =>
                a.nombre.localeCompare(b.nombre, 'es'),
            );

            onOptionsChange(nextOptions);
            onValueChange(created.id);
            setDialogOpen(false);
        } catch (e) {
            if (e instanceof PostJsonError) {
                setCreateError(e.errors.nombre?.[0] ?? e.message);
            } else {
                setCreateError('No se pudo guardar. Intente de nuevo.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="faro-field">
            <Label>{label}</Label>
            <Select
                value={value ? String(value) : ''}
                onValueChange={handleSelectChange}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                            {option.nombre}
                        </SelectItem>
                    ))}
                    {options.length > 0 && <SelectSeparator />}
                    <SelectItem value={CREATE_VALUE} className="text-primary">
                        <span className="flex items-center gap-2">
                            <Plus className="size-4" />
                            {config.createLabel}
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>
            <InputError message={error} />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:max-w-md">
                    <DialogHeader className="space-y-2 border-b border-border/50 px-6 py-5 text-left">
                        <DialogTitle className="text-lg font-semibold">{config.dialogTitle}</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Se agregará al listado y quedará seleccionada en el producto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 px-6 py-5">
                        <div className="faro-field">
                            <Label htmlFor={`${kind}-nombre`}>Nombre</Label>
                            <Input
                                id={`${kind}-nombre`}
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder={config.placeholder}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        void handleCreate();
                                    }
                                }}
                            />
                            <InputError message={createError} />
                        </div>
                    </div>
                    <DialogFooter className="flex-row gap-2 border-t border-border/50 bg-muted/20 px-6 py-4 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setDialogOpen(false)}
                            disabled={saving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="success"
                            className="rounded-xl"
                            disabled={saving}
                            onClick={() => void handleCreate()}
                        >
                            {saving ? 'Guardando…' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
