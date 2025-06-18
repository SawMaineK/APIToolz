import React, { useEffect, useState } from 'react';
import { KeenIcon, useDataGrid } from '@/components';
import { Filter, ModelContentProps } from '../_models';
import FilterSelect from '@/components/filter/FilterSelect';
import { Switch } from '@/components/ui/switch';
import FilterRadio from '@/components/filter/FilterRadio';
import { isBoolean } from 'lodash';

const DataTableFilter = ({ model }: ModelContentProps) => {
  const { table, setQuerySearch } = useDataGrid();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Reset search and filters on model change
    setSearchQuery('');
    setQuerySearch('');
    table.setColumnFilters([]);
    table.setPageIndex(0);
  }, [model]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    table.setPageIndex(0);
    setSearchQuery(value);
    setQuerySearch(value);
  };

  const filterCols = (old: any, key: string, value: any) => {
    const index = old.findIndex((f: any) => f.id === key);
    if (isBoolean(value)) {
      value = value === true ? '1' : '0';
    }
    if (index > -1) {
      if (value === '') {
        return old.filter((f: any) => f.id !== key);
      } else {
        const updated = [...old];
        updated[index].value = value;
        return updated;
      }
    } else {
      return value === '' ? old : [...old, { id: key, value }];
    }
  };

  return (
    <div className="card-header border-b-0 px-5 flex-wrap">
      <h3 className="card-title font-medium text-sm">
        Showing {table.getRowCount()} of {table.getPrePaginationRowModel().rows.length}{' '}
        {model?.slug}s
      </h3>
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <div className="flex gap-2">
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
              />
              <input
                type="text"
                placeholder={`Search ${model.title}`}
                className="input ps-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          {model.config?.filters?.map((filter: Filter) => {
            if (filter.type === 'select') {
              return (
                <FilterSelect
                  key={filter.key}
                  filter={filter}
                  onValueChange={(value: string) => {
                    table.setPageIndex(0);
                    table.setColumnFilters((old) => filterCols(old, filter.key, value));
                  }}
                />
              );
            }
            if (filter.type === 'checkbox') {
              return (
                <div key={filter.key} className="flex items-center">
                  <Switch
                    id={filter.key}
                    defaultChecked={false}
                    onCheckedChange={(checked) => {
                      console.log(checked);
                      table.setPageIndex(0);
                      table.setColumnFilters((old) => filterCols(old, filter.key, checked));
                    }}
                  />
                  <label htmlFor={filter.key} className="form-label ms-2">
                    {filter.query}
                  </label>
                </div>
              );
            }
            if (filter.type === 'radio') {
              return (
                <FilterRadio
                  key={filter.key}
                  filter={filter}
                  table={table}
                  filterCols={filterCols}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export { DataTableFilter };
