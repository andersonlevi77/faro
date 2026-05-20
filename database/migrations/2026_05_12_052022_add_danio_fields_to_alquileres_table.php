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
        Schema::table('alquileres', function (Blueprint $table) {
            $table->text('danio_descripcion')->nullable()->after('notas');
            $table->decimal('danio_monto', 12, 2)->default(0)->after('danio_descripcion');
            $table->decimal('deposito_devuelto', 12, 2)->nullable()->after('danio_monto');
        });
    }

    public function down(): void
    {
        Schema::table('alquileres', function (Blueprint $table) {
            $table->dropColumn(['danio_descripcion', 'danio_monto', 'deposito_devuelto']);
        });
    }
};
