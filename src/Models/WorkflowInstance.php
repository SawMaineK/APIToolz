<?php

namespace Sawmainek\Apitoolz\Models;

use Illuminate\Database\Eloquent\Model;
use Sawmainek\Apitoolz\Traits\QueryFilterTrait;
use Spatie\Permission\Models\Role;

class WorkflowInstance extends Model
{
    use QueryFilterTrait;

    protected $fillable = [
        'workflow_id',
        'workflow_name',   // redundancy for quick search/reporting
        'current_step',
        'current_step_label',
        'data',
        'model_type',
        'model_id',
        'status',          // draft, running, completed, failed, cancelled
        'initiator_id',    // user who started the workflow
        'priority',        // low, normal, high, urgent
        'due_date',        // SLA target
        'completed_at',    // timestamp when completed
        'cancelled_at',    // timestamp if cancelled
        'failed_reason',   // store reason/error for failed workflows
        'metadata',        // flexible JSON for extra tracking
        'roles',
    ];

    protected $casts = [
        'data' => 'array',
        'roles' => 'array',
        'metadata' => 'array',
        'due_date' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    protected $searchable = [
        'workflow_name', 'current_step', 'roles'
    ];

    // Relationships
    public function workflow()
    {
        return $this->belongsTo(Workflow::class, 'workflow_id');
    }

    public function stepHistories()
    {
        return $this->hasMany(WorkflowStepHistory::class, 'workflow_instance_id');
    }

    public function model()
    {
        return $this->morphTo();
    }

    public function initiator()
    {
        return $this->belongsTo(\App\Models\User::class, 'initiator_id');
    }

}
