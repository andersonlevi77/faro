<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('alquileres')->whereIn('estado', ['borrador', 'reservado', 'cancelado'])->update(['estado' => 'creado']);
        DB::table('alquileres')->where('estado', 'en_uso')->update(['estado' => 'entregado']);
        DB::table('alquileres')->where('estado', 'cerrado')->update(['estado' => 'devuelto']);

        DB::table('alquiler_estado_historials')->whereIn('estado_anterior', ['borrador', 'reservado', 'cancelado'])->update(['estado_anterior' => 'creado']);
        DB::table('alquiler_estado_historials')->whereIn('estado_nuevo', ['borrador', 'reservado', 'cancelado'])->update(['estado_nuevo' => 'creado']);
        DB::table('alquiler_estado_historials')->where('estado_anterior', 'en_uso')->update(['estado_anterior' => 'entregado']);
        DB::table('alquiler_estado_historials')->where('estado_nuevo', 'en_uso')->update(['estado_nuevo' => 'entregado']);
        DB::table('alquiler_estado_historials')->where('estado_anterior', 'cerrado')->update(['estado_anterior' => 'devuelto']);
        DB::table('alquiler_estado_historials')->where('estado_nuevo', 'cerrado')->update(['estado_nuevo' => 'devuelto']);

        Schema::create('paquetes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('codigo')->unique();
            $table->text('descripcion')->nullable();
            $table->decimal('precio_alquiler', 12, 2);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('paquete_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paquete_id')->constrained('paquetes')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->decimal('cantidad', 12, 3);
            $table->unique(['paquete_id', 'producto_id']);
        });

        Schema::table('alquiler_lineas', function (Blueprint $table) {
            $table->foreignId('paquete_id')->nullable()->after('producto_id')->constrained('paquetes')->nullOnDelete();
            $table->foreignId('producto_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('alquiler_lineas', function (Blueprint $table) {
            $table->dropForeign(['paquete_id']);
            $table->dropColumn('paquete_id');
        });

        Schema::dropIfExists('paquete_producto');
        Schema::dropIfExists('paquetes');
    }
};
