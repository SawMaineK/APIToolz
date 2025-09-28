<?php

namespace Sawmainek\Apitoolz\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class WorkflowInstanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'workflow_id'           => $this->workflow_id,
            'workflow_name'         => $this->workflow_name,
            'current_step'          => $this->current_step,
            'current_step_label'    => $this->current_step_label,
            'status'                => $this->status,
            'roles'                 => $this->roles,
            'priority'              => $this->priority,
            'due_date'              => $this->due_date?->toDateString(),
            'completed_at'          => $this->completed_at?->toDateTimeString(),
            'cancelled_at'          => $this->cancelled_at?->toDateTimeString(),
            'failed_reason'         => $this->failed_reason,
            'metadata'              => $this->metadata,
            'initiator'             => $this->whenLoaded('initiator', fn () => [
                'id'   => $this->initiator->id,
                'name' => $this->initiator->name,
                'email'=> $this->initiator->email,
            ]),
            'step_histories'        => WorkflowStepHistoryResource::collection($this->whenLoaded('stepHistories')),
        ];
    }
}
