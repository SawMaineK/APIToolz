<?php

namespace Sawmainek\Apitoolz\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class WorkflowStepHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'label'       => $this->label,
            'action'      => $this->action,
            'status'      => $this->status,
            'data'        => $this->data,
            'comment'     => $this->comment,
            'duration'    => $this->duration,
            'metadata'    => $this->metadata,
            'started_at'  => $this->started_at?->toDateTimeString(),
            'completed_at'=> $this->created_at?->toDateTimeString(),
            'actor'        => $this->whenLoaded('user', fn () => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
                'email'=> $this->user->email,
            ]),
        ];
    }
}
