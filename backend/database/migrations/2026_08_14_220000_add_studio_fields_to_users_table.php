<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 40)->nullable()->unique()->after('name');
            $table->string('pin_hash')->nullable()->after('password');
            $table->foreignId('coach_id')->nullable()->after('role')->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true)->after('coach_id');
        });

        $coachId = User::query()->where('role', User::ROLE_COACH)->value('id');
        $used = [];

        User::query()->where('role', User::ROLE_CLIENT)->orderBy('id')->each(function (User $user) use ($coachId, &$used) {
            $base = Str::slug((string) $user->name, '') ?: 'alumna';
            $base = strtolower(preg_replace('/[^a-z0-9]/', '', $base) ?: 'alumna');
            $username = $base;
            $n = 1;
            while (in_array($username, $used, true) || User::where('username', $username)->where('id', '!=', $user->id)->exists()) {
                $username = $base.$n;
                $n++;
            }
            $used[] = $username;
            $user->forceFill([
                'username' => $username,
                'coach_id' => $coachId,
                'is_active' => true,
            ])->save();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('coach_id');
            $table->dropColumn(['username', 'pin_hash', 'is_active']);
        });
    }
};
