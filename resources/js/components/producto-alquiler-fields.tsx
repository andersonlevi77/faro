import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormData = {
    precio_alquiler_diario: string;
    stock_alquiler: string;
    stock_minimo: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export function ProductoAlquilerFields<T extends FormData>({
    data,
    setData,
    errors,
}: {
    data: T;
    setData: (key: keyof T, value: T[keyof T]) => void;
    errors: FormErrors;
}) {
    return (
        <div className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4">
            <div>
                <p className="text-sm font-medium text-foreground">Alquiler</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Precio diario, stock disponible y alerta de inventario bajo.
                </p>
            </div>

            <div className="faro-form-grid sm:grid-cols-2">
                <div className="faro-field">
                    <Label htmlFor="precio_alquiler_diario">Precio de alquiler por día *</Label>
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
                    <Label htmlFor="stock_alquiler">Stock de alquiler *</Label>
                    <Input
                        id="stock_alquiler"
                        type="number"
                        step={1}
                        min={0}
                        value={data.stock_alquiler}
                        onChange={(e) => setData('stock_alquiler', e.target.value as T[keyof T])}
                        required
                    />
                    <InputError message={errors.stock_alquiler} />
                </div>
                <div className="faro-field sm:col-span-2">
                    <Label htmlFor="stock_minimo">Alerta si queda en 0 o por debajo de</Label>
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
        </div>
    );
}
