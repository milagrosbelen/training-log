<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'training_type')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('training_type', 20)->default('gym');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('users', 'training_type')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('training_type');
        });
    }
};
