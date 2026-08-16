<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'user_id',
        'coach_id',
        'week_current',
        'week_total',
        'days_per_week',
        'objective',
        'sessions',
    ];

    protected $casts = [
        'week_current' => 'integer',
        'week_total' => 'integer',
        'days_per_week' => 'integer',
        'sessions' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function completions()
    {
        return $this->hasMany(PlanCompletion::class);
    }
}
