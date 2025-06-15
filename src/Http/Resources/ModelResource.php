<?php
namespace Sawmainek\Apitoolz\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;

class ModelResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'title' => $this->title,
            'desc' => $this->desc,
            'key' => $this->key,
            'type' => $this->type,
            'config' => ModelConfigUtils::decryptJson($this->config),
            'auth' => $this->auth,
            'table' => $this->table,
            'two_factor' => $this->two_factor,
            'lock' => $this->lock,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
        $grids = $data['config']['grid'] ?? [];
        foreach ($grids as $i => $grid) {
            if(isset($grid['only_roles']) && count($grid['only_roles']) > 0) {
                $grids[$i]['view'] = $request->user() && collect($grid['only_roles'])->contains(function ($role) use ($request) {
                    return $request->user()->hasRole($role);
                });
            }
        }
        $data['config']['grid'] = $grids;
        return $data;
    }
}
