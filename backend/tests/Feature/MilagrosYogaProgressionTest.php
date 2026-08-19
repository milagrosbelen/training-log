<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MilagrosYogaProgressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_milagros_can_manage_yoga_library_and_attempts(): void
    {
        Storage::fake('public');

        $coach = User::create([
            'name' => 'Coach',
            'email' => 'coach@example.com',
            'password' => 'secret123',
            'role' => User::ROLE_COACH,
            'username' => 'coach',
            'training_type' => User::TRAINING_HOME,
        ]);

        $milagros = User::create([
            'name' => 'Milagros',
            'email' => 'milagros@example.com',
            'password' => 'secret123',
            'role' => User::ROLE_CLIENT,
            'username' => 'milagros',
            'training_type' => User::TRAINING_HOME,
        ]);

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson('/api/coach/yoga-exercises', [
                'user_id' => $milagros->id,
                'name' => 'Equilibrio sobre una pierna',
                'description' => 'Mantener el equilibrio con control respiratorio.',
                'image' => UploadedFile::fake()->image('equilibrio.png', 800, 600),
                'stages' => [
                    ['title' => 'Mantener posición inicial', 'description' => 'Con las piernas activas.'],
                    ['title' => 'Levantar la pierna', 'description' => 'Elevar sin perder control.'],
                    ['title' => 'Dominio + 3 respiraciones', 'description' => 'Completar la secuencia y respirar profundo.'],
                ],
            ]);

        $response->assertStatus(201);
        $exerciseId = $response->json('data.id');
        $this->assertNotNull($exerciseId);
        $this->assertCount(3, $response->json('data.stages'));

        $progressResponse = $this->actingAs($milagros, 'sanctum')
            ->getJson('/api/profile/yoga-progressions');

        $progressResponse->assertStatus(200);
        $progressResponse->assertJsonPath('data.items.0.name', 'Equilibrio sobre una pierna');

        $attempt = $this->actingAs($milagros, 'sanctum')
            ->postJson('/api/profile/yoga-progressions/attempts', [
                'exercise_id' => $exerciseId,
                'reached_stage' => 2,
                'deep_breathing_done' => false,
                'notes' => 'Hoy me salió bien la elevación.',
            ]);

        $attempt->assertStatus(201);
        $attempt->assertJsonPath('data.reached_stage', 2);

        $mastery = $this->actingAs($milagros, 'sanctum')
            ->postJson('/api/profile/yoga-progressions/attempts', [
                'exercise_id' => $exerciseId,
                'reached_stage' => 3,
                'deep_breathing_done' => true,
                'notes' => 'Completé la secuencia y respire profundo.',
            ]);

        $mastery->assertStatus(201);
        $mastery->assertJsonPath('data.mastered', true);

        $quickPractice = $this->actingAs($milagros, 'sanctum')
            ->postJson('/api/profile/yoga-progressions/quick-practice', [
                'name' => 'Pose nueva de práctica',
                'reached_stage' => 1,
                'deep_breathing_done' => false,
                'notes' => 'La probé hoy dentro del registro diario.',
            ]);

        $quickPractice->assertStatus(201);
        $quickPractice->assertJsonPath('data.name', 'Pose nueva de práctica');
    }

    public function test_delfi_and_jo_remain_isolated_from_milagros_progression(): void
    {
        $delfi = User::create([
            'name' => 'Delfi',
            'email' => 'delfi@example.com',
            'password' => 'secret123',
            'role' => User::ROLE_CLIENT,
            'username' => 'delfi',
            'training_type' => User::TRAINING_GYM,
        ]);

        $jo = User::create([
            'name' => 'Jo',
            'email' => 'jo@example.com',
            'password' => 'secret123',
            'role' => User::ROLE_CLIENT,
            'username' => 'jo',
            'training_type' => User::TRAINING_GYM,
        ]);

        $delfiResponse = $this->actingAs($delfi, 'sanctum')
            ->getJson('/api/profile/yoga-progressions');
        $delfiResponse->assertStatus(200);
        $this->assertSame([], $delfiResponse->json('data.items'));

        $joResponse = $this->actingAs($jo, 'sanctum')
            ->getJson('/api/profile/yoga-progressions');
        $joResponse->assertStatus(200);
        $this->assertSame([], $joResponse->json('data.items'));
    }
}
