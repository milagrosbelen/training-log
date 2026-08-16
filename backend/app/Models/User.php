<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_COACH = 'coach';
    public const ROLE_CLIENT = 'client';

    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'avatar',
        'focus',
        'is_active',
        'coach_id',
    ];

    protected $hidden = [
        'password',
        'pin_hash',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    public function workouts()
    {
        return $this->hasMany(Workout::class);
    }

    public function assignedPlan()
    {
        return $this->hasOne(Plan::class);
    }

    public function coach()
    {
        return $this->belongsTo(self::class, 'coach_id');
    }

    public function alumnas()
    {
        return $this->hasMany(self::class, 'coach_id');
    }

    public function isCoach(): bool
    {
        return $this->role === self::ROLE_COACH;
    }

    public function isAlumna(): bool
    {
        return $this->role === self::ROLE_CLIENT;
    }

    public function ownsAlumna(self $alumna): bool
    {
        return $this->isCoach()
            && $alumna->isAlumna()
            && (int) $alumna->coach_id === (int) $this->id;
    }

    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'avatar' => $this->avatar,
            'focus' => $this->focus,
            'is_active' => (bool) $this->is_active,
        ];
    }

    public function applyConfiguredCoachRole(): void
    {
        $emails = collect(explode(',', (string) config('milogit.coach_emails')))
            ->map(fn ($email) => strtolower(trim($email)))
            ->filter();

        if ($emails->isEmpty()) {
            return;
        }

        $shouldBeCoach = $emails->contains(strtolower((string) $this->email));

        if ($shouldBeCoach && $this->role !== self::ROLE_COACH) {
            $this->forceFill(['role' => self::ROLE_COACH])->save();
        }
    }
}
