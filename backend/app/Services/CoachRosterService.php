<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CoachRosterService
{
    public static function alumnasFor(User $coach): array
    {
        $rows = DB::select(
            'select
                u.id,
                u.name,
                u.username,
                u.email,
                u.role,
                u.avatar,
                u.focus,
                coalesce(u.training_type, ?) as training_type,
                u.is_active,
                exists(select 1 from plans p where p.user_id = u.id) as has_plan
            from users u
            where u.coach_id = ?
              and u.role = ?
            order by u.name asc',
            [User::TRAINING_GYM, $coach->id, User::ROLE_CLIENT]
        );

        return array_map(function ($row) {
            return [
                'id' => (int) $row->id,
                'name' => $row->name,
                'username' => $row->username,
                'email' => $row->email,
                'role' => $row->role,
                'avatar' => $row->avatar,
                'avatar_url' => $row->avatar ? Storage::url($row->avatar) : null,
                'focus' => $row->focus,
                'training_type' => $row->training_type ?: User::TRAINING_GYM,
                'is_active' => (bool) $row->is_active,
                'has_plan' => (bool) $row->has_plan,
            ];
        }, $rows);
    }
}
