<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'pose_progress')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->json('pose_progress')->nullable();
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('users', 'pose_progress')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('pose_progress');
        });
    }
};
