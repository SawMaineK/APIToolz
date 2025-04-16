import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Filter } from '@/pages/model/_models';

interface FilterRadioProps {
  filter: Filter;
  table: {
    setPageIndex: (index: number) => void;
    setColumnFilters: (callback: (old: any) => any) => void;
  };
  filterCols: (old: any, key: string, checked: boolean) => any;
}

const FilterRadio: React.FC<FilterRadioProps> = ({ filter, table, filterCols }) => {
  const queryData = filter.query.split('|');
  return (
    <div key={filter.key} className="flex items-center gap-2">
      {queryData.map((item: string) => {
        const [key, value] = item.split(':');
        return (
          <div key={key} className="flex items-center">
            <input
              type="radio"
              id={`${filter.key}-${key}`}
              name={filter.key}
              value={key}
              className="radio"
              onChange={(e: any) => {
                const value = e.target.value;
                table.setPageIndex(0);
                table.setColumnFilters((old) => filterCols(old, filter.key, value));
              }}
            />
            <label htmlFor={`${filter.key}-${key}`} className="form-label ms-2">
              {value}
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default FilterRadio;
