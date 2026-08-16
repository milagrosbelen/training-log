<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanCompletion extends Model
{
    protected $fillable = [
        'plan_id',
        'week_number',
        'weekday',
        'completed_exercises',
    ];

    protected $casts = [
        'week_number' => 'integer',
        'weekday' => 'integer',
        'completed_exercises' => 'array',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}
