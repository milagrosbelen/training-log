<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workout;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExerciseImageTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_upload_an_exercise_image(): void
    {
        Storage::fake('public');

        $user = User::create([
            'name' => 'Milagros',
            'email' => 'coach@example.com',
            'password' => 'secret123',
            'role' => User::ROLE_COACH,
            'training_type' => User::TRAINING_HOME,
        ]);

        $workout = Workout::create([
            'user_id' => $user->id,
            'date' => '2026-08-19',
            'type' => 'Gimnasio',
            'duration' => 30,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/exercises', [
                'workout_id' => $workout->id,
                'name' => 'Postura de yoga nueva',
                'image' => UploadedFile::fake()->image('postura.png', 800, 600),
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Postura de yoga nueva');
        $this->assertNotNull($response->json('data.image'));
        $this->assertStringContainsString('/storage/', $response->json('data.image_url'));
    }
}
