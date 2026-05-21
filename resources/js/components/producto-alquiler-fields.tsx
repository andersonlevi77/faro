import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TrackingModeOption {
    value: string;
    label: string;
}

type FormData = {
    es_alquilable: boolean;
    tracking_mode: string;
    precio_alquiler_diario: string;
    deposito_unitario: string;
    stock_alquiler: string;
    stock_minimo: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export function ProductoAlquilerFields<T extends FormData>({
    data,
    setData,
    errors,
    trackingModes,
}: {
    data: T;
    setData: (key: keyof T, value: T[keyof T]) => void;
    errors: FormErrors;
    trackingModes: TrackingModeOption[];
}) {
    return (
        <div className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4">
            <div>
                <p className="text-sm font-medium text-foreground">Configuración de alquiler</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Precio, depósito y disponibilidad para contratos de alquiler.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="es_alquilable"
                    checked={data.es_alquilable}
                    onChange={(e) => setData('es_alquilable', e.target.checked as T[keyof T])}
                    className="size-4 rounded border-input"
                />
                <Label htmlFor="es_alquilable">Disponible para alquiler</Label>
            </div>

            {data.es_alquilable && (
                <div className="space-y-4">
                    <div className="faro-field !border-0 !bg-transparent !p-0">
                        <Label>Modo de seguimiento</Label>
                        <Select
                            value={data.tracking_mode}
                            onValueChange={(v) => setData('tracking_mode', v as T[keyof T])}
                        >
                            <SelectTrigger className="w-full bg-white dark:bg-card">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {trackingModes.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {data.tracking_mode === 'individual'
                                ? 'Cada unidad física tiene código único (andamios, toldos, herramientas).'
                                : 'Se controla por cantidad total (sillas, mesas, volumen).'}
                        </p>
                        <InputError message={errors.tracking_mode} />
                    </div>

                    <div className="faro-form-grid sm:grid-cols-2">
                        <div className="faro-field">
                            <Label htmlFor="precio_alquiler_diario">Precio alquiler / día *</Label>
                            <Input
                                id="precio_alquiler_diario"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.precio_alquiler_diario}
                                onChange={(e) => setData('precio_alquiler_diario', e.target.value as T[keyof T])}
                                required
                            />
                            <InputError message={errors.precio_alquiler_diario} />
                        </div>
                        <div className="faro-field">
                            <Label htmlFor="deposito_unitario">Depósito / garantía</Label>
                            <Input
                                id="deposito_unitario"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.deposito_unitario}
                                onChange={(e) => setData('deposito_unitario', e.target.value as T[keyof T])}
                                placeholder="Monto por unidad"
                            />
                            <InputError message={errors.deposito_unitario} />
                        </div>
                    </div>

                    {data.tracking_mode === 'bulk' && (
                        <div className="faro-form-grid sm:grid-cols-2">
                            <div className="faro-field">
                                <Label htmlFor="stock_alquiler">Stock para alquiler *</Label>
                                <Input
                                    id="stock_alquiler"
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    value={data.stock_alquiler}
                                    onChange={(e) => setData('stock_alquiler', e.target.value as T[keyof T])}
                                    required
                                />
                                <InputError message={errors.stock_alquiler} />
                            </div>
                            <div className="faro-field">
                                <Label htmlFor="stock_minimo">Alerta si queda en o por debajo de</Label>
                                <Input
                                    id="stock_minimo"
                                    type="number"
                                    min="0"
                                    value={data.stock_minimo}
                                    onChange={(e) => setData('stock_minimo', e.target.value as T[keyof T])}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Aviso en el panel cuando el stock de alquiler sea bajo.
                                </p>
                                <InputError message={errors.stock_minimo} />
                            </div>
                        </div>
                    )}

                    {data.tracking_mode === 'individual' && (
                        <p className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                            Las unidades físicas se registran desde la ficha del producto después de guardar.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
