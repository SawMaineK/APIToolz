import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { toast } from 'sonner';
import { Filter } from '@/pages/model/_models';

interface FilterSelectProps {
  filter: Filter;
  onValueChange: (value: string) => void;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ filter, onValueChange }) => {
  const [dataList, setDataList] = useState([] as any[]);
  const loadOptions = async (inputValue: any) => {
    try {
      if (filter.model) {
        const url = inputValue
          ? `${import.meta.env.VITE_APP_API_URL}/${filter.model_slug}?search=${inputValue}&fields=${filter.value},${filter.display}&per_page=1000`
          : `${import.meta.env.VITE_APP_API_URL}/${filter.model_slug}?fields=${filter.value},${filter.display}&per_page=1000`;
        return await axios.get(url).then(({ data }) => {
          return data.data.map((item: any) => ({
            label: filter.display
              ?.split(',')
              ?.map((x) => item[x])
              ?.join(' '),
            value: item[filter.value || 'id']
          }));
        });
      } else {
        const queryData = filter.query?.split('|');
        const list = queryData.map((item: string) => {
          const [key, value] = item.split(':');
          return {
            label: value,
            value: key
          };
        });
        if (inputValue) {
          return list.filter((option: any) => option.value.includes(inputValue));
        }
        return list;
      }
    } catch (error) {
      toast.error('Error loading filter options');
      return [];
    }
  };

  useEffect(() => {
    loadOptions('').then((data) => {
      setDataList(data);
    });
  }, []);

  const styles = {
    control: (base: any, state: any) => ({
      ...base,
      color: 'var(--tw-gray-700)',
      backgroundColor: 'var(--tw-light-active)',
      fontSize: '0.8125rem',
      fontWeight: '500',
      minHeight: '2.5rem',
      padding: '0 0.1rem',
      borderWidth: '1px',
      borderRadius: '0.375rem',
      borderColor: state.isFocused ? 'var(--tw-primary)' : 'var(--tw-gray-300)',
      '&:hover': {
        borderColor: 'var(--tw-primary)'
      }
    }),
    menu: (base: any) => ({
      ...base,
      fontSize: '0.9rem',
      zIndex: 9999
    }),
    option: (base: any, state: any) => ({
      ...base,
      fontSize: '0.85rem',
      backgroundColor: state.isFocused ? 'var(--tw-light-active)' : base.backgroundColor,
      color: state.isFocused ? 'var(--tw-gray-700)' : base.color
    })
  };
  return (
    <div className="flex flex-wrap gap-4">
      <div key={filter.title} className="w-48">
        <AsyncSelect
          isClearable
          classNamePrefix="form-select"
          placeholder={`Filter by ${filter.title}`}
          styles={styles}
          defaultOptions={dataList}
          loadOptions={(inputValue) => loadOptions(inputValue)}
          onChange={(selectedOption: any) => {
            const value = selectedOption ? selectedOption.value : '';
            onValueChange(value);
          }}
        />
      </div>
    </div>
  );
};

export default FilterSelect;
