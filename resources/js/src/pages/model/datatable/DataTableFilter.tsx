import React, { useEffect, useState } from 'react';
import { KeenIcon, useDataGrid } from '@/components';
import { Filter, ModelContentProps } from '../_models';
import FilterSelect from '@/components/filter/FilterSelect';
import { Switch } from '@/components/ui/switch';
import FilterRadio from '@/components/filter/FilterRadio';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { isBoolean } from 'lodash';
import { CalendarCog } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

const DataTableFilter = ({ model }: ModelContentProps) => {
  const { table, setQuerySearch } = useDataGrid();
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  });

  useEffect(() => {
    // Reset search and filters on model change
    setSearchQuery('');
    setQuerySearch('');
    table.setColumnFilters([]);
    table.setPageIndex(0);
    // Sort filters by position on model change
    if (model.config?.filters) {
      model.config.filters = [...model.config.filters].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      );
    }
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
      <h3 className="card-title font-medium text-md">Filter by:</h3>
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
              />
              <input
                type="text"
                placeholder={`Search by keywords`}
                className="input ps-8 min-w-[180px]"
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
            if (filter.type === 'date') {
              return (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      id="date"
                      className={
                        cn(
                          'btn btn-light data-[state=open]:bg-light-active',
                          !date && 'text-gray-400'
                        ) + ' min-w-[240px]'
                      }
                    >
                      <CalendarCog size={16} />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(date.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={(selected: DateRange | undefined) => {
                        setDate(selected);
                        table.setPageIndex(0);
                        table.setColumnFilters((old) => filterCols(old, filter.key, selected));
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
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
