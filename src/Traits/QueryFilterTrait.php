<?php

namespace Sawmainek\Apitoolz\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

trait QueryFilterTrait
{
    /**
     * Allowed operators mapping.
     *
     * @var array
     */
    protected array $allowedOperators = [
        'eq' => '=', 'neq' => '!=', 'gt' => '>', 'gte' => '>=',
        'lt' => '<', 'lte' => '<=', 'like' => 'LIKE', 'not_like' => 'NOT LIKE',
        'between' => 'BETWEEN', 'in' => 'IN', 'not_in' => 'NOT IN'
    ];

    /**
     * Apply filtering dynamically based on request parameters.
     *
     * @param Builder $query
     * @param Request $request
     * @return Builder
     *
     * Usage:
     * This method is applied to a query builder in your Eloquent model. You can call it like this:
     *
     * $model::filter($request);
     *
     * URL Parameters:
     * - `filter`: Define filters in the format `field:value|field:value` (e.g., `name:John|status:active`).
     * - `search`: Full-text search query applied to searchable fields.
     * - `sort_by`: The field by which to sort (e.g., `name`).
     * - `sort_dir`: The direction of sorting (`asc` or `desc`, default is `asc`).
     * - `with_trashed`: Include soft-deleted records.
     * - `only_trashed`: Only include soft-deleted records.
     * - `aggregate`: Apply aggregation functions (e.g., `SUM:amount`).
     */
    public function scopeFilter(Builder $query, Request $request): Builder
    {
        // Cache handling (Optional)
        // $cacheKey = $this->getCacheKey($request);
        // if (Cache::has($cacheKey)) {
        //     return Cache::get($cacheKey);
        // }

        // Handle soft delete support
        if ($request->has('with_trashed')) {
            $query->withTrashed();
        } elseif ($request->has('only_trashed')) {
            $query->onlyTrashed();
        }

        // Apply search if the search parameter is set
        if ($request->has('search') && $request->query('search')) {
            $this->applySearchFilter($query, $request->query('search'));
        }

        // Check if the 'filter' parameter exists in the request
        if ($request->has('filter')) {
            $filters = explode('|', $request->query('filter'));

            foreach ($filters as $filter) {
                list($field, $value) = explode(':', $filter, 2);

                // Apply filters for relations (e.g. user.name)
                if (str_contains($field, '.')) {
                    [$relation, $column] = explode('.', $field, 2);
                    $query->whereHas($relation, function ($q) use ($column, $value) {
                        $this->applyFilters($q, $column, $value);
                    });
                } else {
                    $this->applyFilters($query, $field, $value);
                }
            }
        }

        // Handle geolocation filtering (latitude, longitude, radius)
        if ($request->has('latitude') && $request->has('longitude')) {
            $query->geolocation($request->query('latitude'), $request->query('longitude'), $request->query('radius', 10));
        }

        // Handle aggregations
        if ($request->has('aggregate')) {
            return $query->aggregate($request);
        }

        // Apply sorting
        if ($request->has('sort_by')) {
            $query->orderBy($request->query('sort_by'), $request->query('sort_dir', 'asc'));
        }

        // Cache the query results (Optional)
        // $cacheDuration = 60; // 60 minutes by default
        // Cache::put($cacheKey, $query, $cacheDuration);

        return $query;
    }

    /**
     * Apply a general search filter to the query.
     *
     * @param Builder $query
     * @param string $searchTerm
     *
     * URL Parameters:
     * - `search`: The search query that is applied to the fields defined in `$searchable`.
     */
    private function applySearchFilter(Builder $query, string $searchTerm)
    {
        // You can define which columns you want to search here
        $searchFields = $this->searchable ?? [];
        foreach ($searchFields as $field) {
            $query->orWhere($field, 'LIKE', "%{$searchTerm}%");
        }
    }

    /**
     * Apply filters to the query.
     *
     * @param Builder $query
     * @param string $field
     * @param mixed $values
     *
     * URL Parameters:
     * - `filter`: Specify filters in the format `field:value|field:value` (e.g., `status:active|age:30`).
     *
     * Supported operators:
     * - `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `not_like`, `between`, `in`, `not_in`.
     *
     * Example:
     * `/api/model?filter=status:active|age:25&sort_by=name`
     */
    private function applyFilters(Builder $query, string $field, mixed $values)
    {
        if (!is_array($values)) {
            $values = [$values];
        }

        $query->where(function ($subQuery) use ($field, $values) {
            foreach ($values as $value) {
                if (str_contains($value, ':')) {
                    [$operatorKey, $actualValue] = explode(':', $value, 2);
                    $operator = $this->allowedOperators[$operatorKey] ?? '=';
                } else {
                    $operator = '=';
                    $actualValue = $value;
                }

                if ($operator === 'LIKE' || $operator === 'NOT LIKE') {
                    $actualValue = "%$actualValue%";
                } elseif ($operator === 'BETWEEN') {
                    $range = explode(',', $actualValue);
                    if (count($range) == 2) {
                        $subQuery->orWhereBetween($field, [$range[0], $range[1]]);
                        continue;
                    }
                } elseif ($operator === 'IN' || $operator === 'NOT IN') {
                    $valuesArray = explode(',', $actualValue);
                    $subQuery->orWhereIn($field, $valuesArray);
                    continue;
                }

                $subQuery->orWhere($field, $operator, $actualValue);
            }
        });
    }

    /**
     * Handle full-text search for a specific field.
     *
     * @param Builder $query
     * @param string $field
     * @param string $searchTerm
     * @return Builder
     *
     * URL Parameters:
     * - `search`: Full-text search query applied to searchable fields.
     *
     * Example:
     * `/api/model?search=John`
     */
    public function scopeFullTextSearch(Builder $query, string $field, string $searchTerm): Builder
    {
        if ($this->isSQLite()) {
            // SQLite full-text search
            return $query->whereRaw("{$field} MATCH ?", [$searchTerm]);
        }

        // MySQL or other database systems
        return $query->whereRaw("MATCH($field) AGAINST(? IN NATURAL LANGUAGE MODE)", [$searchTerm]);
    }

    private function isSQLite(): bool
    {
        return DB::getDriverName() === 'sqlite';
    }

    /**
     * Apply geolocation filtering to the query.
     *
     * @param Builder $query
     * @param float $latitude
     * @param float $longitude
     * @param int $radius
     * @return Builder
     *
     * URL Parameters:
     * - `latitude`: Latitude of the point to filter by.
     * - `longitude`: Longitude of the point to filter by.
     * - `radius`: Radius in kilometers (default is 10).
     *
     * Example:
     * `/api/model?latitude=12.9716&longitude=77.5946&radius=10`
     */
    public function scopeGeolocation(Builder $query, float $latitude, float $longitude, int $radius = 10): Builder
    {
        $haversine = "(6371 * acos(cos(radians($latitude))
            * cos(radians(latitude))
            * cos(radians(longitude) - radians($longitude))
            + sin(radians($latitude))
            * sin(radians(latitude))))";
        return $query->select('*')
                     ->addSelect(DB::raw("{$haversine} AS distance"))
                     ->having('distance', '<', $radius);
    }

    /**
     * Apply aggregations (SUM, AVG, COUNT, MIN, MAX).
     *
     * @param Builder $query
     * @param Request $request
     * @return mixed
     *
     * URL Parameters:
     * - `aggregate`: Define aggregation functions like `SUM:amount`, `AVG:rating`, etc.
     *
     * Example:
     * `/api/model?aggregate=SUM:amount`
     */
    public function scopeAggregate(Builder $query, Request $request)
    {
        if ($request->has('aggregate')) {
            [$method, $field] = explode(':', $request->query('aggregate'));
            $method = strtoupper($method);

            if (in_array($method, ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX'])) {
                return $query->$method($field);
            }
        }

        return $query;
    }

    /**
     * Generate a unique cache key based on request parameters.
     *
     * @param Request $request
     * @return string
     *
     * Usage:
     * This method generates a unique cache key based on the query parameters in the request.
     * It is used for caching purposes.
     */
    private function getCacheKey(Request $request): string
    {
        return 'query_filter_' . md5(serialize($request->query()));
    }
}
