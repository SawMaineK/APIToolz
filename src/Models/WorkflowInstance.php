<?php

namespace Sawmainek\Apitoolz\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowInstance extends Model
{
    protected $fillable = [
        'workflow_name',
        'current_step',
        'data',
        'model_type',
        'model_id',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function stepHistories()
    {
        return $this->hasMany(WorkflowStepHistory::class, 'workflow_instance_id');
    }

    public function model()
    {
        return $this->morphTo();
    }
}
