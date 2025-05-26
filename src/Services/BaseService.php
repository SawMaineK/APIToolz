<?php

namespace Sawmainek\Apitoolz\Services;

use Illuminate\Http\Request;

abstract class BaseService
{
    protected $modelClass;
    protected $hook;

    public function __construct()
    {
        if (!isset($this->modelClass)) {
            throw new \Exception('Model class must be defined in the child service.');
        }

        $this->hook = $this->resolveHook($this->modelClass);
    }

    protected function resolveHook(string $modelClass)
    {
        $baseName = class_basename($modelClass);
        $hookClass = "App\\Hooks\\{$baseName}Hook";

        return class_exists($hookClass) ? app($hookClass) : null;
    }

    protected function callHook(string $method, ...$params)
    {
        if ($this->hook && method_exists($this->hook, $method)) {
            return $this->hook->{$method}(...$params);
        }
    }
}
