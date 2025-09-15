<?php

namespace Sawmainek\Apitoolz\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowStepHistory extends Model
{
    protected $fillable = [
        'workflow_instance_id',
        'step_id',
        'data',
        'action',
        'user_id'
    ];

    protected $casts = [
        'data' => 'array'
    ];

    public function instance()
    {
        return $this->belongsTo(WorkflowInstance::class, 'workflow_instance_id');
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
