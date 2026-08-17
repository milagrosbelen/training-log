<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateAlumna extends Command
{
    protected $signature = 'milogit:create-alumna {name} {username} {pin} {--coach=milagrospedrasa1@gmail.com} {--type=gym}';

    protected $description = 'Crea o actualiza una alumna con usuario y PIN.';

    public function handle(): int
    {
        $coach = User::query()
            ->where('email', strtolower(trim((string) $this->option('coach'))))
            ->where('role', User::ROLE_COACH)
            ->first();

        if (!$coach) {
            $this->error('No está la cuenta coach. Creala primero.');

            return self::FAILURE;
        }

        $name = trim((string) $this->argument('name'));
        $username = strtolower(trim((string) $this->argument('username')));
        $pin = (string) $this->argument('pin');
        $trainingType = strtolower(trim((string) $this->option('type')));

        if (!in_array($trainingType, User::TRAINING_TYPES, true)) {
            $this->error('El tipo tiene que ser gym o home.');

            return self::FAILURE;
        }

        if (!preg_match('/^[0-9]{4,6}$/', $pin)) {
            $this->error('El PIN tiene que tener 4 a 6 números.');

            return self::FAILURE;
        }

        $user = User::query()->firstOrNew(['username' => $username]);
        $user->fill([
            'name' => $name,
            'username' => $username,
            'email' => $username.'@alumnas.milogit.local',
            'password' => Str::random(40),
            'is_active' => true,
            'coach_id' => $coach->id,
            'training_type' => $trainingType,
        ]);
        $user->forceFill([
            'role' => User::ROLE_CLIENT,
            'pin_hash' => Hash::make($pin),
        ])->save();

        $this->info("Alumna lista: {$username} · PIN {$pin}");

        return self::SUCCESS;
    }
}
