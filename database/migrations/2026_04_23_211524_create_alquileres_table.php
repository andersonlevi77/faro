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
        Schema::create('alquileres', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('estado', 32)->index();
            $table->date('fecha_inicio_prevista');
            $table->date('fecha_fin_prevista');
            $table->timestamp('fecha_entrega_at')->nullable();
            $table->timestamp('fecha_devolucion_at')->nullable();
            $table->decimal('deposito_monto', 12, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->index(['fecha_inicio_prevista', 'fecha_fin_prevista']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alquileres');
    }
};
