<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class EnsureCoach extends Command
{
    protected $signature = 'milogit:ensure-coach {email} {--password=} {--name=Coach}';

    protected $description = 'Crea o actualiza la cuenta coach para el panel.';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        $password = (string) $this->option('password');
        $name = trim((string) $this->option('name')) ?: 'Coach';

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Pasá un email válido.');

            return self::FAILURE;
        }

        if (strlen($password) < 6) {
            $this->error('La contraseña tiene que tener al menos 6 caracteres.');

            return self::FAILURE;
        }

        $user = User::query()->firstOrNew(['email' => $email]);
        $user->fill([
            'name' => $name,
            'password' => $password,
            'is_active' => true,
            'username' => $user->username ?: strstr($email, '@', true),
        ]);
        $user->forceFill(['role' => User::ROLE_COACH])->save();

        $this->info("Coach lista: {$user->email}");

        return self::SUCCESS;
    }
}
