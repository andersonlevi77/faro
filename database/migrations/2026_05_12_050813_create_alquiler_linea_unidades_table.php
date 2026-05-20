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
        Schema::create('alquiler_linea_unidades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alquiler_linea_id')->constrained('alquiler_lineas')->cascadeOnDelete();
            $table->foreignId('producto_unidad_id')->constrained('producto_unidades')->restrictOnDelete();
            $table->timestamps();

            $table->unique(['alquiler_linea_id', 'producto_unidad_id'], 'alu_linea_unidad_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alquiler_linea_unidades');
    }
};
