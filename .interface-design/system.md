# Faro — Sistema de interfaz (POS Farmacia)

## Dirección y sensación

- **Dominio:** Farmacia, inventario, mostrador, confianza, claridad, salud.
- **Paleta:** Azul/cian, alegre y profesional. Primario = azul (hue 235). Fondos limpios; dark con tonos azulados suaves.
- **Profundidad:** Bordes suaves (border-border/80), sombras muy ligeras (shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]). Sin sombras fuertes.
- **Superficies:** Sidebar mismo fondo que el canvas (--sidebar = --background); separación por borde (--sidebar-border). Header con borde inferior y opcional backdrop-blur.

## Tokens clave

- **Primary:** oklch azul/cian (hue 235) — botones principales, ítem activo en nav, enlaces de acción, estado “Activo”.
- **Ring/Focus:** Mismo azul que primary.
- **Bordes:** Neutros, chroma bajo. Evitar bordes duros.
- **Inputs:** Fondo blanco (bg-white) para sensación de limpieza; dark:bg-card. Borde sutil border-border/50; focus con ring primary/20.

## Espaciado

- Base: 4px. Contenido de página: p-4 md:p-5, gap-5 entre secciones. Formularios: max-w-4xl para aprovechar ancho; cards p-6, sin bordes fuertes.

## Patrones de componentes

- **Card:** sin borde o muy sutil; shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]. Títulos con icono en contenedor redondeado bg-primary/10 text-primary (size-9 rounded-lg).
- **Tabla:** contenedor bg-muted/20 sin borde grueso; thead bg-muted/30, bordes border-border/30–40.
- **Botón Buscar:** variant secondary (neutro), coherente con la paleta minimal.
- **Botón primario:** primary (azul/cian). Outline/Ghost: hover:bg-accent hover:text-accent-foreground.
- **Sidebar nav:** Ítem activo bg-sidebar-primary (azul), texto sidebar-primary-foreground. Hover: sidebar-accent.
- **App sidebar header:** h-14, border-b border-sidebar-border, bg-background/95 backdrop-blur. SidebarTrigger con hover:bg-sidebar-accent.

## Dark mode

- Primary azul más brillante sobre fondo oscuro; fondos con tinte azulado; bordes suaves.
