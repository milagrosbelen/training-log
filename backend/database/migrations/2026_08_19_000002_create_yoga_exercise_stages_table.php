<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('yoga_exercise_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercise_id')->constrained('yoga_exercises')->onDelete('cascade');
            $table->unsignedInteger('sort_order')->default(1);
            $table->string('title');
            $table->text('description')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('yoga_exercise_stages');
    }
};
