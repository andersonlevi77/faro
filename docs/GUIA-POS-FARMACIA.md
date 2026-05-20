# Guía: Punto de Venta para Farmacias

Documento de evaluación y planificación del módulo POS (Point of Sale) enfocado en farmacias, sobre Laravel 12 + Inertia v2 + React 19.

---

## 1. Alcance y objetivos

### 1.1 Visión
Sistema de punto de venta integrado al flujo de la aplicación, pensado para:
- **Venta rápida** en mostrador (medicamentos y productos de farmacia).
- **Inventario** con control de caducidad y lotes (opcional en v1).
- **Reportes básicos** de ventas y movimientos.
- **Roles**: cajero, farmacéutico, administrador (aprovechando Spatie Permission ya instalado).

### 1.2 Fuera de alcance (v1)
- Facturación electrónica / integración con SAT (se deja preparado el modelo).
- Integración con lectores de código de barras (soporte de campo/UI sí).
- Múltiples sucursales/almacenes (una farmacia por instalación en v1).
- Recetas médicas digitales (solo campo de referencia si se requiere).

---

## 2. Stack y convenciones

| Capa        | Tecnología              | Uso en POS                          |
|------------|--------------------------|-------------------------------------|
| Backend    | Laravel 12               | API lógica, modelos, políticas      |
| Frontend   | Inertia v2 + React 19    | Páginas SPA, formularios, estado   |
| Estilos    | Tailwind CSS v4          | UI consistente con el resto del app|
| Rutas TS   | Wayfinder                | `@/routes`, `@/actions`             |
| Permisos   | Spatie Permission         | Roles: admin, farmacéutico, cajero |
| Tests      | Pest 4                   | Feature y unit tests                |

- **Creación de artefactos**: usar `php artisan make:... -a` donde aplique (modelo, migración, factory, seeder, controlador, form request).
- **Código**: reutilizable (componentes React, traits/scope en modelos, servicios) y escalable (módulos por dominio, rutas agrupadas).

---

## 3. Modelo de dominio (entidades)

### 3.1 Núcleo del POS

| Entidad        | Descripción breve |
|----------------|--------------------|
| **Product**    | Producto vendible: nombre, SKU/código, precio, tipo (medicamento/producto general), unidad, código de barras, caducidad, lote. |
| **Category**   | Categoría de productos (ej. Analgésicos, Vitaminas, Cuidado personal). |
| **Sale**       | Venta: usuario que registra, fecha/hora, total, estado (completada, cancelada, pendiente). |
| **SaleItem**   | Línea de venta: sale_id, product_id, cantidad, precio unitario, subtotal. |

### 3.2 Extensibilidad (diseño preparado)

| Entidad       | Uso en v1 |
|---------------|-----------|
| **Customer**  | Opcional: cliente genérico o “público general” para reportes. |
| **Payment**   | Forma de pago por venta (efectivo, tarjeta, etc.) para reportes y cierre de caja. |
| **Stock/Batch** | Opcional v1: lotes y fechas de caducidad; deja estructura lista. |

Se prioriza **Product**, **Category**, **Sale**, **SaleItem** y, si se desea cierre de caja, **Payment**.

---

## 4. Estructura de base de datos (resumen)

- **categories**: id, name, slug, description (nullable), parent_id (nullable), timestamps.
- **products**: id, category_id (nullable), name, slug, sku (unique), barcode (nullable), type (enum: medication, general), unit (pieza, caja, etc.), price (decimal), cost (nullable), is_active, timestamps.
- **sales**: id, user_id, status (enum: completed, cancelled, pending), total (decimal), notes (nullable), timestamps.
- **sale_items**: id, sale_id, product_id, quantity (decimal), unit_price (decimal), subtotal (decimal), timestamps.

Índices: `products.sku`, `products.barcode`, `sales.user_id`, `sales.created_at`, `sale_items.sale_id`, `sale_items.product_id`.

Relaciones:
- Category: `hasMany(Product)`.
- Product: `belongsTo(Category)`, `hasMany(SaleItem)`.
- Sale: `belongsTo(User)`, `hasMany(SaleItem)`.
- SaleItem: `belongsTo(Sale)`, `belongsTo(Product)`.

---

## 5. Módulos y rutas (plan)

### 5.1 Rutas backend (agrupadas bajo prefijo y middleware)

- `pos.*` (POS en uso):
  - `GET  /pos` → Caja/punto de venta (página principal del POS).
  - `POST /pos/sales` → Crear venta (store).
  - `GET  /pos/sales/{sale}` → Ver venta (opcional, para reimprimir).
- **Catálogos** (CRUD reutilizable):
  - `products`: index, create, store, edit, update, destroy (o soft delete).
  - `categories`: index, create, store, edit, update, destroy.

Todas bajo `auth` + `verified`; permisos con Spatie (ej. `pos.sell`, `products.manage`, `categories.manage`).

### 5.2 Páginas Inertia (React)

- `pos/index.tsx` — Pantalla de venta: búsqueda/agregar productos, carrito, total, botón cobrar.
- `pos/sales/show.tsx` — Detalle de venta (opcional).
- `products/index.tsx`, `products/create.tsx`, `products/edit.tsx` — Listado y formularios.
- `categories/index.tsx`, `categories/create.tsx`, `categories/edit.tsx` — Listado y formularios.

Componentes reutilizables (en `resources/js/components/`):
- `DataTable` (o uso de tabla existente) para listados.
- `ProductSearch` / `ProductSelector` para el POS.
- `CartSummary` para resumen de venta.
- Formularios compartidos (inputs, selects) alineados con el diseño actual.

---

## 6. Buenas prácticas aplicadas

- **Backend**
  - Form Requests para validación (StoreSaleRequest, UpdateProductRequest, etc.).
  - Políticas (ProductPolicy, SalePolicy, CategoryPolicy) para autorización.
  - Servicios/acciones para lógica de negocio (ej. `CreateSale` o método en un `SaleService`) en lugar de controladores gordos.
  - Uso de Eloquent con relaciones y eager loading para evitar N+1.
  - Transacciones DB en creación de venta (Sale + SaleItems).
- **Frontend**
  - Componentes pequeños y reutilizables; páginas que orquestan.
  - Uso de `useForm` (Inertia) para formularios; envío a acciones Wayfinder.
  - Estado local solo donde haga falta (carrito en POS); el resto vía props/backend.
- **Escalabilidad**
  - Namespaces por dominio (ej. `App\Http\Controllers\Pos\`, `App\Models\` con Product, Sale, etc.).
  - Rutas y controladores agrupados por módulo (pos, products, categories).
  - Preparar DTOs o Resources si más adelante se expone API.

---

## 7. Roles y permisos (Spatie)

Sugerencia de roles y permisos:

| Rol            | Permisos sugeridos                          |
|----------------|---------------------------------------------|
| admin          | Todo (pos.*, products.*, categories.*, reportes). |
| farmacéutico   | pos.sell, pos.view_sales, products.view.    |
| cajero         | pos.sell, products.view (solo venta y consulta). |

Permisos concretos a definir en seeder: `pos.sell`, `pos.view_sales`, `products.manage`, `products.view`, `categories.manage`, `categories.view`.

---

## 8. Fases de implementación sugeridas

1. **Fase 1 – Base**
   - Migraciones: categories, products, sales, sale_items.
   - Modelos con relaciones, factories y seeders básicos.
   - Políticas y permisos (seeders de roles/permisos).

2. **Fase 2 – Catálogos**
   - CRUD de categorías (controlador, Form Requests, páginas Inertia).
   - CRUD de productos (igual).
   - Tests de feature para crear/editar categoría y producto.

3. **Fase 3 – POS**
   - Controlador/acción para crear venta (validación, transacción, cálculo de totales).
   - Página POS: búsqueda de productos, carrito, enviar venta.
   - Tests: venta completa, validaciones, permisos.

4. **Fase 4 – Refuerzo**
   - Listado de ventas (filtros por fecha, usuario).
   - Ajustes de UI/UX y reportes básicos (opcional).
   - Documentación mínima si se requiere.

---

## 9. Criterios de aceptación (resumen)

- [ ] Alta de categorías y productos con validación y políticas.
- [ ] Pantalla de venta: agregar productos por búsqueda/selector, ver carrito, total y registrar venta.
- [ ] Venta persistida en BD con ítems y total correcto; uso de transacciones.
- [ ] Control de acceso por roles (cajero/farmacéutico/admin).
- [ ] Tests automatizados (Pest) que cubran flujos críticos.
- [ ] Código formateado con Pint y convenciones del proyecto (Wayfinder, Inertia, Tailwind).

---

## 10. Próximos pasos

1. Revisar esta guía y ajustar alcance (por ejemplo incluir Payment desde v1 o dejar Batch para después).
2. Aprobar fases; entonces se procederá a implementar usando `php artisan make:... -a` y las convenciones descritas.
3. Tras Fase 1, se pueden revisar juntos nombres de tablas/campos y relaciones antes de seguir con catálogos y POS.

Si estás de acuerdo con esta guía, el siguiente paso es implementar la **Fase 1** (modelos, migraciones, relaciones, seeders de permisos y datos básicos).
