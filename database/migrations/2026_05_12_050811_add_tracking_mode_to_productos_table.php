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
            $table->string('tracking_mode', 16)->default('bulk')->after('es_alquilable');
            $table->decimal('deposito_unitario', 12, 2)->nullable()->after('precio_alquiler_diario');
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn(['tracking_mode', 'deposito_unitario']);
        });
    }
};
