<?php

namespace Sawmainek\Apitoolz\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowStepHistory extends Model
{
    protected $fillable = [
        'workflow_instance_id',
        'step_id',
        'label',           // human-readable step name
        'data',
        'action',          // approve, reject, submit, auto-progress
        'status',          // pending, in_progress, completed, failed
        'comment',         // remarks by actor
        'user_id',
        'duration',        // how long step took (seconds/minutes)
        'metadata',        // flexible JSON for extra tracking
        'started_at',      // step started time
        'completed_at',    // step completed time
    ];

    protected $casts = [
        'data' => 'array',
        'metadata' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
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
