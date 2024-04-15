<?php

namespace Sawmainek\Apitoolz\Traits;

use Closure;
trait QueryBuilderTrait
{
    /**
     *  Can use only -- keyword & -- search
     *  Can use only -- nested & -- search
     *  General Search -- keyword=[keyword]
     *  Key Search -- search=[field:equal:value:when|...]
     *  Nested Search -- nested_query=[{ category : { do : [field:equal:value:else|...] , when: [ if , else ] | ... } }]
     *  Additional Note -- when => whereHas(...)
     */

    public function querySearch($keyword = "", $search = "", $limit = "")
    {
        $columns = explode('|', $search);
        $columns = array_merge($columns, explode('|', $limit));
        $query = $this->search($keyword);
        foreach($columns as $column) {
            $param = explode(':', $column);
            if(count($param) == 3) {
                $query = $query->where($param[0] ." {$this->operator($param[1])}", isset($param[2]) ? $param[2] : '');
            }
        }
       return $query;
    }

    public function querySearchNoKeyword($search ="", $limit = "")
    {
        $columns = explode('|', $search);
        $columns = array_merge($columns, explode('|', $limit));
        $query = $this;
        foreach ($columns as $column) {
            $param = explode(':', $column);
            if (count($param) >= 3) {
                $param[2] = $this->operator($param[1]) == 'Like' ? "%{$param[2]}%" : $param[2];
                $param[2] = $this->operator($param[1]) == 'ILike' ? "%{$param[2]}%" : $param[2];
                if(isset($param[3]) && $param[3] == 'true') {
                    $query = $query->orwhere($param[0], $this->operator($param[1]), isset($param[2]) ? $param[2]  : '');
                } else {
                    $query = $query->where($param[0], $this->operator($param[1]), isset($param[2]) ? $param[2]  : '');
                }
            }
        }
        return $query;
    }

    public function nestedSearch($nested,$search, $limit = "")
    {
        $query = $this;
        foreach ($this->searchableRelations($nested) as $relation => $object) {
            $columns = explode('|', $object['do']);
            $columns = array_merge($columns, explode('|', $limit));
            if($object['when'] == "if") {
                $query = $query->whereHas($relation, function ($query) use ($columns) {
                    $query->where($this->searchQueryApplier($columns));
                });
            } else {
                $query = $query->orWhereHas($relation, function ($query) use ($columns) {
                    $query->orwhere($this->searchQueryApplier($columns));
                });
            }
        }
    
        $columns = explode('|', $search);
        return $query->where($this->searchQueryApplier($columns));
    }

    /**
     * Get the searchable columns for the resource.
     *
     * @return array
     */
    function searchableRelations(string $nested) 
    {
        return json_decode($nested,true) ?? [];
    }

    /**
     * Returns a Closure that applies a search query for a given columns.
     *
     * @param  array $columns
     * @param  string $search
     * @return \Closure
     */
    function searchQueryApplier(array $columns): Closure
    {
        return function ($query) use ($columns) {
            $model = $query->getModel();
            foreach ($columns as $column) {
                $param = explode(':', $column);
                if(count($param) > 2) {
                    $param[2] = $this->operator($param[1]) == 'Like' ? "%{$param[2]}%" : $param[2];
                    $param[2] = $this->operator($param[1]) == 'ILike' ? "%{$param[2]}%" : $param[2];
                    if(isset($param[3]) && $param[3] == true) {
                        $query->orwhere($model->qualifyColumn($param[0]), $this->operator($param[1]), $param[2]);
                    } else {
                        $query->where($model->qualifyColumn($param[0]), $this->operator($param[1]), $param[2]);
                    }  
                }
            }
        };
    }

    /**
     * Resolve the query operator.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return string
     */
    function operator($operate): string
    {
        $cast = '';
        switch ($operate) {
            case 'ne': //Not equal
                $cast = '!=';
                break;
            case 'lt': //Less than
                $cast = '<';
                break;
            case 'lte': //Less than equal
                $cast = '<=';
                break;
            case 'gt': //Grater than
                $cast = '>';
                break;
            case 'gte': //Grater then equal
                $cast = '>=';
                break;
            case 'like':
                $cast = 'Like';
                break;
            case 'ilike':
                $cast = 'ILike';
                break;
            default: //e => equal
                $cast = '=';
                break;
        }
        return $cast;
    }
}
