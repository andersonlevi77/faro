import type { ComboboxOption } from '@/components/searchable-combobox';
import { fmtQ } from '@/lib/utils';

export type ClienteComboboxSource = {
    id: number;
    nombre: string;
    documento: string | null;
    email?: string | null;
    telefono?: string | null;
};

export type ProductoAlquilerComboboxSource = {
    id: number;
    nombre: string;
    codigo: string;
    stock_alquiler: string;
    stock_disponible: string;
    precio_alquiler_diario: string;
    marca_nombre?: string | null;
    categoria_nombre?: string | null;
};

export type ProductoSimpleComboboxSource = {
    id: number;
    nombre: string;
    codigo: string;
};

export type UnidadComboboxSource = {
    id: number;
    codigo: string;
    estado_label: string;
    producto_nombre: string | null;
    producto_codigo: string | null;
};

export function clienteComboboxOptions(clientes: ClienteComboboxSource[]): ComboboxOption<number>[] {
    return clientes
        .map((cliente) => {
            const documento = cliente.documento?.trim() ?? '';
            const label = documento ? `${cliente.nombre} · ${documento}` : cliente.nombre;
            const descriptionParts = [cliente.email, cliente.telefono].filter(
                (part): part is string => Boolean(part && part.trim() !== ''),
            );

            return {
                value: cliente.id,
                label,
                description: descriptionParts.length > 0 ? descriptionParts.join(' · ') : undefined,
                searchText: [cliente.nombre, documento, cliente.email, cliente.telefono]
                    .filter((part): part is string => Boolean(part && String(part).trim() !== ''))
                    .join(' '),
            };
        })
        .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

export function productoAlquilerComboboxOptions(
    productos: ProductoAlquilerComboboxSource[],
): ComboboxOption<number>[] {
    return productos
        .map((producto) => {
            const meta = [
                producto.marca_nombre,
                producto.categoria_nombre,
                `stock ${producto.stock_alquiler}`,
                `${fmtQ(producto.precio_alquiler_diario ?? '0')}/día`,
            ].filter((part): part is string => Boolean(part && String(part).trim() !== ''));

            return {
                value: producto.id,
                label: `${producto.nombre} (${producto.codigo})`,
                description: meta.join(' · '),
                searchText: [
                    producto.nombre,
                    producto.codigo,
                    producto.marca_nombre,
                    producto.categoria_nombre,
                    producto.stock_alquiler,
                ]
                    .filter((part): part is string => Boolean(part && String(part).trim() !== ''))
                    .join(' '),
            };
        })
        .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

export function productoSimpleComboboxOptions(
    productos: ProductoSimpleComboboxSource[],
): ComboboxOption<number>[] {
    return productos
        .map((producto) => ({
            value: producto.id,
            label: `${producto.nombre} (${producto.codigo})`,
            searchText: [producto.nombre, producto.codigo].join(' '),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

export function unidadComboboxOptions(unidades: UnidadComboboxSource[]): ComboboxOption<number>[] {
    return unidades
        .map((unidad) => ({
            value: unidad.id,
            label: unidad.codigo,
            description: [
                unidad.producto_nombre,
                unidad.producto_codigo ? `(${unidad.producto_codigo})` : null,
                unidad.estado_label,
            ]
                .filter((part): part is string => Boolean(part && String(part).trim() !== ''))
                .join(' · '),
            searchText: [
                unidad.codigo,
                unidad.producto_nombre,
                unidad.producto_codigo,
                unidad.estado_label,
            ]
                .filter((part): part is string => Boolean(part && String(part).trim() !== ''))
                .join(' '),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}
