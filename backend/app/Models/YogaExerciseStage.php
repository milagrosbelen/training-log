<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class YogaExerciseStage extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'exercise_id',
        'sort_order',
        'title',
        'description',
    ];

    public function exercise()
    {
        return $this->belongsTo(YogaExercise::class, 'exercise_id');
    }
}
