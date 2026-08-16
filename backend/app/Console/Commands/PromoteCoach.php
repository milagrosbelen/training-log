<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PromoteCoach extends Command
{
    protected $signature = 'milogit:promote-coach {email?}';

    protected $description = 'Asigna el rol coach a un usuario. Sin email, lista las cuentas.';

    public function handle(): int
    {
        $email = $this->argument('email');

        if (!$email) {
            $this->table(
                ['ID', 'Nombre', 'Email', 'Rol'],
                User::query()->orderBy('id')->get(['id', 'name', 'email', 'role'])->map(fn (User $u) => [
                    $u->id,
                    $u->name,
                    $u->email,
                    $u->role,
                ])
            );
            $this->info('Uso: php artisan milogit:promote-coach correo@ejemplo.com');

            return self::SUCCESS;
        }

        $user = User::where('email', strtolower(trim($email)))->first();

        if (!$user) {
            $this->error('No existe un usuario con ese email.');

            return self::FAILURE;
        }

        $user->forceFill(['role' => User::ROLE_COACH])->save();
        $this->info("{$user->name} ({$user->email}) ahora es coach.");

        return self::SUCCESS;
    }
}
