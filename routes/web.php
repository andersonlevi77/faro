<?php

use App\Http\Controllers\AlquilerController;
use App\Http\Controllers\AlquilerEstadoController;
use App\Http\Controllers\CalendarioController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MantenimientoController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PaqueteController;
use App\Http\Controllers\PresentacionController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ProductoUnidadController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('clientes', ClienteController::class);
    Route::resource('alquileres', AlquilerController::class)
        ->parameters(['alquileres' => 'alquiler']);
    Route::post('alquileres/{alquiler}/estado', [AlquilerEstadoController::class, 'update'])
        ->name('alquileres.estado.update');
    Route::post('alquileres/{alquiler}/pagos', [PagoController::class, 'store'])
        ->name('alquileres.pagos.store');
    Route::delete('alquileres/{alquiler}/pagos/{pago}', [PagoController::class, 'destroy'])
        ->name('alquileres.pagos.destroy');

    Route::resource('mantenimientos', MantenimientoController::class)
        ->only(['index', 'create', 'store', 'show', 'update'])
        ->parameters(['mantenimientos' => 'mantenimiento']);

    Route::get('calendario', CalendarioController::class)->name('calendario');
    Route::get('reportes', ReporteController::class)->name('reportes');

    Route::get('usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
    Route::get('usuarios/crear', [UsuarioController::class, 'create'])->name('usuarios.create');
    Route::post('usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
    Route::get('usuarios/{user}/editar', [UsuarioController::class, 'edit'])->name('usuarios.edit');
    Route::put('usuarios/{user}', [UsuarioController::class, 'update'])->name('usuarios.update');
    Route::patch('usuarios/{user}/activo', [UsuarioController::class, 'updateActivo'])->name('usuarios.activo.update');
    Route::delete('usuarios/{user}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');

    Route::resource('roles', RoleController::class);

    Route::post('categorias', [CategoriaController::class, 'store'])->name('categorias.store');
    Route::post('marcas', [MarcaController::class, 'store'])->name('marcas.store');
    Route::post('presentaciones', [PresentacionController::class, 'store'])->name('presentaciones.store');

    Route::resource('productos', ProductoController::class)->names('productos');
    Route::resource('paquetes', PaqueteController::class)->names('paquetes');
    Route::resource('productos.unidades', ProductoUnidadController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->shallow();
});

require __DIR__.'/settings.php';
