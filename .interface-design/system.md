# Faro — Sistema de interfaz (plantilla DocuMed)

## Dirección y sensación

- **Dominio:** Gestión de alquileres, inventario, clientes, operaciones diarias.
- **Paleta:** Azul primario `#155DFC`, verde éxito `#1DA871`, amarillo `#FFD971`, naranja `#FC6D3B`, texto `#1A1A1A`. Fondo canvas gris muy claro; cards blancas.
- **Profundidad:** Sombras suaves (`shadow-card`), sin bordes gruesos en cards. Separación sidebar/contenido por borde sutil.
- **Formas:** Border-radius generoso (16px cards, píldoras en nav y badges, inputs redondeados).

## Tokens clave

- **Primary:** Azul royal — botones, nav activo, títulos de bienvenida.
- **Canvas:** Fondo del área principal (`--canvas`).
- **Success / Warning / Orange:** Semánticos para KPIs y estados.
- **Sidebar:** Blanco; ítem activo = píldora azul sólida con texto blanco.

## Espaciado

- Contenido: `p-4 md:p-6`, `gap-6` entre secciones.
- Header: `h-[4.25rem]`, sticky, fondo card.

## Patrones de componentes

- **Card:** `rounded-2xl`, `shadow-card`, sin borde, hover `shadow-card-hover`.
- **Button:** `rounded-xl`; outline secundario; primario azul sólido.
- **Input:** `rounded-xl` o `rounded-full` en búsqueda del header.
- **Badge:** `rounded-full` (píldora).
- **Dialog / Sheet / Dropdown / Select:** `rounded-2xl` o `rounded-xl`, `shadow-card`, overlay con blur.
- **StatKpiCard:** Label uppercase pequeño, icono en cuadrado `rounded-xl` con tinte, número grande.
- **Header:** Título página | búsqueda centrada | campana + avatar con nombre/rol.
- **Sidebar:** Logo gradiente + nombre + subtítulo; nav píldora; cerrar sesión rojo al pie.

## Clases globales (usar en todas las páginas)

- `.faro-page` — contenedor de página (padding, gap).
- `.faro-page-icon` — icono de título en card.
- `.faro-form-card` — formularios en card.
- `.faro-table-wrap` — tablas con estilo unificado.
- `.faro-list-row` — filas de listas.
- `.faro-textarea` / `.faro-native-select` — controles nativos.
- `.faro-status-*` — badges de estado (excelente, bueno, regular, bajo).

## Dark mode

- Primary más brillante; canvas y cards con tinte azulado oscuro; sombras más marcadas.
