<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->foreignId('coach_id')->constrained('users')->onDelete('cascade');
            $table->unsignedInteger('week_current')->default(1);
            $table->unsignedInteger('week_total')->default(8);
            $table->json('sessions')->nullable();
            $table->timestamps();
        });

        Schema::create('plan_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('week_number');
            $table->unsignedTinyInteger('weekday');
            $table->json('completed_exercises')->nullable();
            $table->timestamps();

            $table->unique(['plan_id', 'week_number', 'weekday']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_completions');
        Schema::dropIfExists('plans');
    }
};
