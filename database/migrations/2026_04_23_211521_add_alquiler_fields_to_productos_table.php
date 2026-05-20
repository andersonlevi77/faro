<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->boolean('es_alquilable')->default(false)->after('activo');
            $table->decimal('stock_alquiler', 12, 3)->default(0)->after('es_alquilable');
            $table->decimal('precio_alquiler_diario', 12, 2)->nullable()->after('stock_alquiler');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn(['es_alquilable', 'stock_alquiler', 'precio_alquiler_diario']);
        });
    }
};
