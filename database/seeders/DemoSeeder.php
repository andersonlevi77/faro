<?php

namespace Database\Seeders;

use App\Enums\EstadoAlquiler;
use App\Enums\EstadoMantenimiento;
use App\Enums\MetodoPago;
use App\Enums\TipoPago;
use App\Enums\TrackingMode;
use App\Models\Alquiler;
use App\Models\AlquilerLinea;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Mantenimiento;
use App\Models\Marca;
use App\Models\Pago;
use App\Models\Presentacion;
use App\Models\Producto;
use App\Models\ProductoUnidad;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // ── Usuarios ──────────────────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@demo.com'],
            ['name' => 'Admin Demo', 'password' => Hash::make('password')],
        );
        $admin->assignRole('administrador');

        $vendedor = User::firstOrCreate(
            ['email' => 'ventas@demo.com'],
            ['name' => 'Laura Ventas', 'password' => Hash::make('password')],
        );
        $vendedor->assignRole('ventas');

        $tecnico = User::firstOrCreate(
            ['email' => 'logistica@demo.com'],
            ['name' => 'Carlos Logística', 'password' => Hash::make('password')],
        );
        $tecnico->assignRole('logistica');

        // ── Catálogo base ─────────────────────────────────────────────────────
        $categorias = $this->crearCategorias();
        $marcas = $this->crearMarcas();
        $pres = Presentacion::firstOrCreate(['nombre' => 'Unidad']);

        // ── Productos ─────────────────────────────────────────────────────────
        $productos = $this->crearProductos($categorias, $marcas, $pres);

        // ── Clientes ──────────────────────────────────────────────────────────
        $clientes = $this->crearClientes($admin);

        // ── Alquileres ────────────────────────────────────────────────────────
        $this->crearAlquileres($clientes, $productos, $admin, $vendedor);

        // ── Mantenimientos ────────────────────────────────────────────────────
        $this->crearMantenimientos($productos, $admin, $tecnico);
    }

    // ── Catálogo ──────────────────────────────────────────────────────────────

    /** @return array<string, Categoria> */
    private function crearCategorias(): array
    {
        $items = [
            'Maquinaria pesada' => 'Equipos de construcción y movimiento de tierra',
            'Herramientas eléctricas' => 'Taladros, amoladoras, sierras y similares',
            'Andamios y escaleras' => 'Estructuras de trabajo en altura',
            'Generadores' => 'Grupos electrógenos y plantas eléctricas',
            'Equipos de limpieza' => 'Hidrolavadoras y aspiradoras industriales',
        ];

        $result = [];
        foreach ($items as $nombre => $descripcion) {
            $slug = Str::slug($nombre);
            $result[$nombre] = Categoria::firstOrCreate(
                ['slug' => $slug],
                ['nombre' => $nombre, 'slug' => $slug, 'descripcion' => $descripcion],
            );
        }

        return $result;
    }

    /** @return array<string, Marca> */
    private function crearMarcas(): array
    {
        $nombres = ['Bosch', 'DeWalt', 'Makita', 'Caterpillar', 'Honda', 'Husqvarna', 'Genérico'];

        $result = [];
        foreach ($nombres as $nombre) {
            $result[$nombre] = Marca::firstOrCreate(['nombre' => $nombre]);
        }

        return $result;
    }

    /**
     * @param  array<string, Categoria>  $categorias
     * @param  array<string, Marca>  $marcas
     * @return list<Producto>
     */
    private function crearProductos(array $categorias, array $marcas, Presentacion $pres): array
    {
        $definiciones = [
            // [nombre, categoria, marca, trackingMode, stock/unidades, precioDiario, deposito]
            ['Taladro percutor 800W',        'Herramientas eléctricas', 'Bosch',       TrackingMode::Individual, 4,  '350.00',  '1500.00'],
            ['Amoladora angular 115mm',      'Herramientas eléctricas', 'DeWalt',      TrackingMode::Bulk,       8,  '250.00',  '800.00'],
            ['Compresor de aire 50L',        'Herramientas eléctricas', 'Makita',      TrackingMode::Individual, 3,  '500.00',  '2000.00'],
            ['Andamio multidireccional 2m',  'Andamios y escaleras',    'Genérico',    TrackingMode::Bulk,       20, '180.00',  '600.00'],
            ['Escalera aluminio 6 peldaños', 'Andamios y escaleras',    'Genérico',    TrackingMode::Bulk,       10, '120.00',  '400.00'],
            ['Generador 5000W',              'Generadores',             'Honda',       TrackingMode::Individual, 2,  '900.00',  '3500.00'],
            ['Generador 3000W',              'Generadores',             'Genérico',    TrackingMode::Bulk,       5,  '650.00',  '2500.00'],
            ['Hidrolavadora 150 bar',        'Equipos de limpieza',     'Genérico',    TrackingMode::Individual, 3,  '420.00',  '1800.00'],
            ['Minicargador 226',             'Maquinaria pesada',       'Caterpillar', TrackingMode::Individual, 1,  '4500.00', '15000.00'],
            ['Motosierra 18"',               'Maquinaria pesada',       'Husqvarna',   TrackingMode::Bulk,       4,  '380.00',  '1200.00'],
        ];

        $productos = [];

        foreach ($definiciones as $i => [$nombre, $catNombre, $marcaNombre, $mode, $stockOUnidades, $precioDiario, $deposito]) {
            $codigo = 'EQ-'.str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT);

            $cat = $categorias[$catNombre] ?? array_values($categorias)[0];
            $marca = $marcas[$marcaNombre] ?? $marcas['Genérico'];

            $producto = Producto::firstOrCreate(
                ['codigo' => $codigo],
                [
                    'nombre' => $nombre,
                    'slug' => Str::slug($nombre),
                    'categoria_id' => $cat->id,
                    'marca_id' => $marca->id,
                    'presentacion_id' => $pres->id,
                    'precio_compra' => '0.00',
                    'precio_venta' => '0.00',
                    'stock_minimo' => 1,
                    'activo' => true,
                    'es_alquilable' => true,
                    'tracking_mode' => $mode,
                    'stock_alquiler' => $mode === TrackingMode::Bulk ? (string) $stockOUnidades : '0',
                    'precio_alquiler_diario' => $precioDiario,
                    'deposito_unitario' => $deposito,
                ],
            );

            if ($mode === TrackingMode::Individual && $producto->unidades()->count() === 0) {
                for ($u = 1; $u <= $stockOUnidades; $u++) {
                    ProductoUnidad::factory()->create([
                        'producto_id' => $producto->id,
                        'codigo' => strtoupper(mb_substr($nombre, 0, 3)).'-'.str_pad((string) $u, 3, '0', STR_PAD_LEFT),
                    ]);
                }
            }

            $productos[] = $producto;
        }

        return $productos;
    }

    /**
     * @return list<Cliente>
     */
    private function crearClientes(User $creador): array
    {
        $datos = [
            ['Constructora Rodríguez S.A.',     '20123456789', 'contacto@constructora-rodriguez.com', '011-4523-1234', 'Av. Corrientes 1500', 'Buenos Aires'],
            ['Hernández Obras & Servicios',      '27987654321', 'hernandez.obras@gmail.com',            '011-2211-3344', 'Belgrano 450',        'Córdoba'],
            ['Elena Morales',                    '23456789012', 'elena.morales@yahoo.com',              '0351-445-6789', 'Sarmiento 230',       'Rosario'],
            ['Grupo Constructivo Del Sur',       '30678901234', 'admin@grupodelsur.com.ar',             '011-4888-9900', 'Rivadavia 2300',      'La Plata'],
            ['Miguel Fernández',                 '20567890123', 'miguel.ferna@hotmail.com',             '0261-421-7890', 'San Martín 890',      'Mendoza'],
            ['Alquileres Rápidos SRL',           '30234567891', 'info@alquileresrapidos.com',           '011-4700-1122', 'Libertad 1200',       'Buenos Aires'],
            ['Patricia Suárez',                  '27345678902', 'psuarez@example.com',                  '0387-422-3456', 'Urquiza 560',         'Salta'],
            ['Constructores Unidos SA',          '30789012345', 'operaciones@constructoresunidos.com',  '011-4600-4455', 'Callao 980',          'Buenos Aires'],
            ['Roberto Díaz Contratista',         '20890123456', 'rdiaz.obras@gmail.com',                '0348-421-9876', 'Mitre 340',           'Mar del Plata'],
            ['Servicios Técnicos Altamira',      '30123478901', 'altamira@servicios.com',               '011-4555-8877', 'Pueyrredón 640',      'Buenos Aires'],
            ['Agropecuaria El Ceibo',            '30456789012', 'elceibo@campo.com.ar',                 '03442-42-1234', 'Ruta 12 km 45',       'Concordia'],
            ['Jorge Ramírez',                    '23567890123', 'jramirez@example.com',                 '0291-455-6677', 'Zelarrayán 210',      'Bahía Blanca'],
        ];

        $clientes = [];
        foreach ($datos as [$nombre, $doc, $email, $tel, $dir, $ciudad]) {
            $clientes[] = Cliente::firstOrCreate(
                ['documento' => $doc],
                [
                    'nombre' => $nombre,
                    'email' => $email,
                    'telefono' => $tel,
                    'direccion' => $dir,
                    'ciudad' => $ciudad,
                    'creado_por' => $creador->id,
                ],
            );
        }

        return $clientes;
    }

    /**
     * @param  list<Cliente>  $clientes
     * @param  list<Producto>  $productos
     */
    private function crearAlquileres(array $clientes, array $productos, User $admin, User $vendedor): void
    {
        $metodos = [MetodoPago::Efectivo, MetodoPago::Transferencia, MetodoPago::Tarjeta];

        // [estado, inicio (relativo a hoy), días, fracción pagada (0–1)]
        $escenarios = [
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(10), 5,  1.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(9),  7,  1.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(8),  3,  1.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(7),  10, 1.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(6),  4,  1.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(5),  6,  1.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(4),  8,  1.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(3),  5,  1.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(2),  7,  1.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(1),  4,  1.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subDays(20),   6,  0.8],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subDays(12),   3,  1.0],
            [EstadoAlquiler::Entregado, Carbon::now()->subDays(5),    7,  0.5],
            [EstadoAlquiler::Entregado, Carbon::now()->subDays(3),    10, 0.3],
            [EstadoAlquiler::Entregado, Carbon::now()->subDays(1),    5,  0.0],
            [EstadoAlquiler::Entregado, Carbon::now()->subDays(2),    8,  1.0],
            [EstadoAlquiler::Entregado, Carbon::now(),                6,  0.5],
            [EstadoAlquiler::Creado,    Carbon::now()->addDays(3),    5,  1.0],
            [EstadoAlquiler::Creado,    Carbon::now()->addDays(7),    10, 0.5],
            [EstadoAlquiler::Creado,    Carbon::now()->addDays(14),   4,  0.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(3),  3,  0.0],
            [EstadoAlquiler::Devuelto,  Carbon::now()->subMonths(1),  5,  0.5],
        ];

        $alquilables = array_values(array_filter($productos, fn (Producto $p) => $p->es_alquilable));

        foreach ($escenarios as $idx => [$estado, $inicio, $dias, $fraccionPago]) {
            $cliente = $clientes[$idx % count($clientes)];
            $inicio = Carbon::instance($inicio)->startOfDay();
            $fin = $inicio->copy()->addDays($dias);

            // 1–2 productos por alquiler
            $offset = ($idx * 2) % count($alquilables);
            $productosLinea = array_slice($alquilables, $offset, rand(1, 2));

            $totalAlquiler = 0.0;
            $lineasData = [];
            foreach ($productosLinea as $prod) {
                $cant = rand(1, 3);
                $precio = (float) $prod->precio_alquiler_diario;
                $subtotal = round($precio * $dias * $cant, 2);
                $totalAlquiler += $subtotal;
                $lineasData[] = [
                    'producto_id' => $prod->id,
                    'cantidad' => (string) $cant,
                    'dias' => $dias,
                    'precio_diario' => (string) $precio,
                    'subtotal' => (string) $subtotal,
                ];
            }
            $totalAlquiler = round($totalAlquiler, 2);
            $deposito = round($totalAlquiler * 0.3, 2);

            $alquiler = Alquiler::create([
                'cliente_id' => $cliente->id,
                'user_id' => $vendedor->id,
                'estado' => $estado,
                'fecha_inicio_prevista' => $inicio->toDateString(),
                'fecha_fin_prevista' => $fin->toDateString(),
                'deposito_monto' => (string) $deposito,
                'total' => (string) $totalAlquiler,
                'notas' => null,
            ]);

            foreach ($lineasData as $lineaData) {
                AlquilerLinea::create(array_merge($lineaData, ['alquiler_id' => $alquiler->id]));
            }

            if ($estado === EstadoAlquiler::Devuelto) {
                $alquiler->update([
                    'fecha_devolucion_at' => $fin->copy()->addDays(rand(-1, 2))->toDateString(),
                    'deposito_devuelto' => (string) $deposito,
                ]);
            }

            if ($fraccionPago > 0) {
                $metodo = $metodos[$idx % count($metodos)];
                $montoPagado = round($totalAlquiler * $fraccionPago, 2);

                Pago::create([
                    'alquiler_id' => $alquiler->id,
                    'tipo' => TipoPago::Anticipo->value,
                    'monto' => (string) $deposito,
                    'metodo_pago' => $metodo->value,
                    'notas' => 'Anticipo / depósito',
                    'registrado_por' => $admin->id,
                    'created_at' => $inicio->copy()->subDay(),
                ]);

                $restante = round($montoPagado - $deposito, 2);
                if ($restante > 0) {
                    Pago::create([
                        'alquiler_id' => $alquiler->id,
                        'tipo' => TipoPago::PagoAlquiler->value,
                        'monto' => (string) $restante,
                        'metodo_pago' => $metodo->value,
                        'notas' => 'Pago saldo',
                        'registrado_por' => $admin->id,
                        'created_at' => $inicio->copy()->addDays((int) ceil($dias / 2)),
                    ]);
                }

                if ($estado === EstadoAlquiler::Devuelto && $fraccionPago >= 1.0) {
                    Pago::create([
                        'alquiler_id' => $alquiler->id,
                        'tipo' => TipoPago::DevolucionDeposito->value,
                        'monto' => (string) $deposito,
                        'metodo_pago' => $metodo->value,
                        'notas' => 'Devolución de depósito',
                        'registrado_por' => $admin->id,
                        'created_at' => $fin->copy()->addDay(),
                    ]);
                }
            }
        }
    }

    /**
     * @param  list<Producto>  $productos
     */
    private function crearMantenimientos(array $productos, User $admin, User $tecnico): void
    {
        $escenarios = [
            [
                'titulo' => 'Revisión general taladro percutor',
                'estado' => EstadoMantenimiento::Completado,
                'costo' => '1200.00',
                'fecha_programada' => Carbon::now()->subMonths(2)->toDateString(),
                'fecha_inicio_at' => Carbon::now()->subMonths(2)->toDateString(),
                'fecha_fin_at' => Carbon::now()->subMonths(2)->addDays(1)->toDateString(),
                'descripcion' => 'Cambio de carbones y limpieza interna.',
            ],
            [
                'titulo' => 'Cambio de aceite compresor',
                'estado' => EstadoMantenimiento::Completado,
                'costo' => '450.00',
                'fecha_programada' => Carbon::now()->subMonths(1)->toDateString(),
                'fecha_inicio_at' => Carbon::now()->subMonths(1)->toDateString(),
                'fecha_fin_at' => Carbon::now()->subMonths(1)->addDays(1)->toDateString(),
                'descripcion' => 'Mantenimiento preventivo anual.',
            ],
            [
                'titulo' => 'Reparación generador - falla arranque',
                'estado' => EstadoMantenimiento::Completado,
                'costo' => '3200.00',
                'fecha_programada' => Carbon::now()->subWeeks(3)->toDateString(),
                'fecha_inicio_at' => Carbon::now()->subWeeks(3)->toDateString(),
                'fecha_fin_at' => Carbon::now()->subWeeks(2)->toDateString(),
                'descripcion' => 'Reemplazo del motor de arranque y bujías.',
            ],
            [
                'titulo' => 'Servicio preventivo amoladora angular',
                'estado' => EstadoMantenimiento::EnProceso,
                'costo' => '0.00',
                'fecha_programada' => Carbon::now()->subDays(3)->toDateString(),
                'fecha_inicio_at' => Carbon::now()->subDays(3)->toDateString(),
                'fecha_fin_at' => null,
                'descripcion' => 'En diagnóstico, espera repuestos.',
            ],
            [
                'titulo' => 'Revisión andamios multidireccionales',
                'estado' => EstadoMantenimiento::EnProceso,
                'costo' => '0.00',
                'fecha_programada' => Carbon::now()->subDays(1)->toDateString(),
                'fecha_inicio_at' => Carbon::now()->subDays(1)->toDateString(),
                'fecha_fin_at' => null,
                'descripcion' => 'Verificación de pasadores y bases.',
            ],
            [
                'titulo' => 'Mantenimiento programado hidrolavadora',
                'estado' => EstadoMantenimiento::Pendiente,
                'costo' => '0.00',
                'fecha_programada' => Carbon::now()->addDays(5)->toDateString(),
                'fecha_inicio_at' => null,
                'fecha_fin_at' => null,
                'descripcion' => null,
            ],
            [
                'titulo' => 'Revisión eléctrica minicargador',
                'estado' => EstadoMantenimiento::Pendiente,
                'costo' => '0.00',
                'fecha_programada' => Carbon::now()->addDays(10)->toDateString(),
                'fecha_inicio_at' => null,
                'fecha_fin_at' => null,
                'descripcion' => 'Control de cableado tras reporte de cliente.',
            ],
        ];

        foreach ($escenarios as $i => $datos) {
            $producto = $productos[$i % count($productos)];

            Mantenimiento::create([
                'producto_id' => $producto->id,
                'titulo' => $datos['titulo'],
                'descripcion' => $datos['descripcion'],
                'costo' => $datos['costo'],
                'estado' => $datos['estado'],
                'fecha_programada' => $datos['fecha_programada'],
                'fecha_inicio_at' => $datos['fecha_inicio_at'],
                'fecha_fin_at' => $datos['fecha_fin_at'],
                'notas' => null,
                'creado_por' => $admin->id,
                'resuelto_por' => $datos['estado'] === EstadoMantenimiento::Completado ? $tecnico->id : null,
            ]);
        }
    }
}
