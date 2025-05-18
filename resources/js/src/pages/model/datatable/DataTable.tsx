import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DataGrid, KeenIcon, useDataGrid } from '@/components';
import axios from 'axios';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { Filter, ModelContentProps } from '../_models';
import { generateColumns } from '../_helper';
import { CreateModal } from '../form/CreateModal';
import FilterSelect from '@/components/filter/FilterSelect';
import { Switch } from '@/components/ui/switch';
import FilterRadio from '@/components/filter/FilterRadio';
import { Link, useNavigate } from 'react-router-dom';

const DataTable = ({ model }: ModelContentProps) => {
  const [modelData, setModelData] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger refresh and reset UI state when model changes
    setRefreshKey((prev) => prev + 1);
    setModelData(null);
    setCreateModalOpen(false);
  }, [model]);

  const columns = useMemo(() => {
    const cols = generateColumns(model.config.grid, model.config.forms, model.config.relationships);

    cols.push(
      {
        id: 'edit',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => {
              setModelData(row.original);
              setCreateModalOpen(true);
            }}
          >
            <KeenIcon icon="notepad-edit" />
          </button>
        ),
        meta: {
          headerClassName:
            'w-[60px] lg:sticky lg:right-[60px] bg-white dark:bg-[--tw-page-bg-dark] z-1',
          cellClassName:
            'w-[60px] lg:sticky lg:right-[60px] bg-white dark:bg-[--tw-page-bg-dark] z-1'
        }
      },
      {
        id: 'delete',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => handleDeleteClick(row.original.id)}
          >
            <KeenIcon icon="trash" />
          </button>
        ),
        meta: {
          headerClassName: 'w-[60px] lg:sticky lg:right-0 bg-white dark:bg-[--tw-page-bg-dark] z-1',
          cellClassName: 'w-[60px] lg:sticky lg:right-0 bg-white dark:bg-[--tw-page-bg-dark] z-1'
        }
      }
    );

    return cols;
  }, [model]);

  const fetchModels = async (params: any) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(params.pageIndex + 1));
      queryParams.set('per_page', String(params.pageSize));
      if (params.sorting?.[0]?.id) {
        queryParams.set('sort_by', params.sorting[0].id);
        queryParams.set('sort_dir', params.sorting[0].desc ? 'desc' : 'asc');
      }
      if (params.columnFilters.length > 0) {
        const values = params.columnFilters.map((f: any) => `${f.id}:${f.value}`);
        queryParams.set(`filter`, values.join('|'));
      }
      if (params.querySearch.length > 0) {
        queryParams.set('search', params.querySearch);
      }

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/${model.slug}?${queryParams.toString()}`
      );
      return {
        data: response.data.data,
        totalCount: response.data.meta.total
      };
    } catch (error) {
      toast.error('Error fetching data');
      return { data: [], totalCount: 0 };
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_APP_API_URL}/${model.slug}/${id}`);
        toast.success('Record deleted successfully');
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        toast.error('Error deleting record');
      }
    }
  };

  const onCreated = () => {
    setCreateModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  const Filters = () => {
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
                  className="input input-sm ps-8"
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
              return null;
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text={model?.title || ''} />
          <ToolbarDescription>
            {model?.desc || `Manage all your ${model?.slug || ''}`}
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Link to={`/apitoolz/model/${model.slug}/builder`} className="btn btn-sm btn-light">
            <KeenIcon icon="setting-2" className="!text-base" />
            Builder
          </Link>
          <button
            onClick={() => {
              if (model.config.forms.length > 8) {
                navigate(`/apitoolz/model/${model.slug}/create`);
              } else {
                setModelData(null);
                setCreateModalOpen(true);
              }
            }}
            className="btn btn-sm btn-primary"
          >
            <KeenIcon icon="plus" />
            {`Add ${model?.name || ''}`}
          </button>
        </ToolbarActions>
      </Toolbar>

      <DataGrid
        key={refreshKey}
        columns={columns}
        serverSide={true}
        onFetchData={fetchModels}
        rowSelection={true}
        getRowId={(row: { id: string }) => row.id}
        pagination={{ size: 10 }}
        toolbar={<Filters />}
        layout={{ card: true }}
      />

      <CreateModal
        open={createModalOpen}
        model={model}
        modelData={modelData}
        onCreated={onCreated}
        onOpenChange={() => setCreateModalOpen(false)}
      />
    </>
  );
};

export { DataTable };
