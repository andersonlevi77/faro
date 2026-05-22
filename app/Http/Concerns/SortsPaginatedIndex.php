<?php

namespace App\Http\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait SortsPaginatedIndex
{
    /**
     * @param  array<string, string|callable(Builder, string): void>  $allowedColumns
     */
    protected function applyIndexSort(
        Builder $query,
        Request $request,
        array $allowedColumns,
        string $defaultColumn = 'created_at',
        string $defaultDirection = 'desc',
    ): Builder {
        $sort = $request->string('sort')->toString();
        $direction = strtolower($request->string('direction')->toString()) === 'asc' ? 'asc' : 'desc';

        if ($sort !== '' && array_key_exists($sort, $allowedColumns)) {
            $column = $allowedColumns[$sort];

            if (is_callable($column)) {
                $column($query, $direction);
            } else {
                $query->orderBy($column, $direction);
            }
        } else {
            $query->orderBy($defaultColumn, $defaultDirection);
        }

        return $query;
    }

    /**
     * @return array{sort: string|null, direction: 'asc'|'desc'|null}
     */
    protected function indexSortFilters(Request $request): array
    {
        $direction = strtolower($request->string('direction')->toString());

        return [
            'sort' => $request->filled('sort') ? $request->string('sort')->toString() : null,
            'direction' => in_array($direction, ['asc', 'desc'], true) ? $direction : null,
        ];
    }
}
