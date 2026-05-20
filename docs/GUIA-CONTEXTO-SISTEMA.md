# Guía de contexto: qué es este sistema

Este documento resume **el propósito real del sistema tal como está implementado en el código**. Sirve como referencia para equipos, nuevas incorporaciones y para alinear el lenguaje del producto con el dominio técnico.

## Qué problema resuelve

La aplicación es un **sistema de gestión de alquileres**: permite registrar **clientes**, mantener un **catálogo de productos** con atributos orientados al alquiler y administrar **órdenes de alquiler** con fechas, líneas de detalle, totales y un **flujo de estados** desde el borrador hasta el cierre.


## Conceptos principales

### Cliente

Persona u organización que contrata alquileres. Incluye datos de contacto y referencia (`nombre`, `documento`, `email`, `telefono`, `direccion`, `ciudad`, `notas`). Tiene muchos **alquileres**.

### Producto (catálogo / inventario)

Representa un ítem del catálogo. Además de datos generales (marca, categoría, presentación, precios, stock tradicional), el modelo distingue explícitamente:

- **`es_alquilable`**: si el ítem puede incluirse en alquileres.
- **`stock_alquiler`**: unidades disponibles para el circuito de alquiler (separado conceptualmente del stock “de venta” u otros usos).
- **`precio_alquiler_diario`**: tarifa diaria usada en el cálculo de líneas.

Los **lotes** siguen modelados para stock con vencimiento (útil si el negocio es regulado o por caducidad); para **disponibilidad de alquiler** el sistema usa principalmente `stock_alquiler` y las reservas superpuestas en el tiempo.

### Alquiler

Documento que agrupa:

- **Identificación**: código único generado (prefijo `ALQ-`).
- **Cliente** y **usuario** asociado (quién registró u opera).
- **Ventana de fechas**: `fecha_inicio_prevista` y `fecha_fin_prevista` (definen el periodo del alquiler y el cálculo de días).
- **Importes**: depósito (`deposito_monto`), total (`total`, recalculable desde líneas).
- **Marcas de tiempo operativas**: `fecha_entrega_at`, `fecha_devolucion_at`.
- **Estado** (ver siguiente sección).
- **Líneas** (`AlquilerLinea`): producto, cantidad, días, precio diario aplicado y subtotal.

### Línea de alquiler

Cada línea amarra un **producto** al **alquiler** con cantidad, número de **días**, precio diario y **subtotal**. El total del alquiler se consolida a partir de las líneas.

## Estados del alquiler y flujo

Los estados están definidos en `EstadoAlquiler` y siguen transiciones controladas:

| Estado      | Rol en el flujo                          |
|------------|--------------------------------------------|
| Borrador   | Borrador editable antes de comprometer   |
| Reservado  | Compromete stock en el rango de fechas    |
| Entregado  | Material entregado al cliente           |
| En uso     | Periodo de uso activo                    |
| Devuelto   | Devolución registrada                    |
| Cerrado    | Operación finalizada                     |
| Cancelado  | Anulado desde borrador o reserva         |

Los estados **Reservado**, **Entregado** y **En uso** se consideran **activos** para alertas (por ejemplo devoluciones atrasadas). Solo ciertos estados **comprometen stock** de alquiler al solaparse en fechas con otros alquileres.

## Disponibilidad y conflictos de stock

El servicio `VerificadorDisponibilidadAlquiler` calcula, para un producto y un rango de fechas:

- Cuánta cantidad ya está **comprometida** por otros alquileres en estados que reservan stock.
- Cuánto queda **disponible** restando eso del `stock_alquiler`.

Así se evita sobre-asignar unidades en periodos solapados y se valida que cada línea sea coherente con `es_alquilable` y stock suficiente.

## Panel principal (dashboard)

El dashboard orienta la operación diaria:

- Conteos de clientes, productos activos, alquileres activos y alquileres del mes.
- **Próximas devoluciones** en una ventana de días.
- **Alquileres atrasados** (fecha fin prevista pasada y aún en estado activo).
- **Productos alquilables con stock de alquiler bajo** respecto al mínimo configurado.

## Usuarios y permisos

La aplicación usa **roles y permisos** (Spatie Laravel Permission). Hay permisos granulares para `dashboard`, `productos`, `clientes`, `alquileres` (incluido **cambiar estado**) y `usuarios`.

Roles de ejemplo en semillas:

- **Administrador**: todos los permisos.
- **Ventas**: operación típica de clientes y alquileres (sin borrar productos ni gestionar usuarios según la lista sembrada).
- **Logística**: consulta y actualización de alquileres y cambio de estado, sin alta de clientes ni gestión completa de catálogo.

Las **policies** de Laravel conectan cada acción con el permiso correspondiente.

## Stack tecnológico (resumen)

- **Backend**: Laravel 12, PHP 8.4.
- **Frontend**: Inertia.js v2 con React 19; interfaz con Tailwind CSS v4.
- **Autenticación**: Laravel Fortify.
- **Rutas tipadas en TypeScript**: Laravel Wayfinder.
- **Pruebas**: Pest 4.

## Cómo usar esta guía

- Para **definir alcance de producto**: el sistema es **gestión de alquileres con catálogo**, no “farmacia” como dominio.
- Para **onboarding**: leer primero **Cliente → Producto (alquiler) → Alquiler → estados**.
- Para **cambios funcionales**: revisar siempre el flujo de **estados**, **fechas** y **VerificadorDisponibilidadAlquiler** porque condicionan reglas de negocio y UI.

---

*Documento alineado con el código en el repositorio. Si el negocio evoluciona (solo alquiler, venta y alquiler, otros verticals), conviene actualizar este archivo y los nombres visibles en la interfaz para que no contradigan el dominio.*
