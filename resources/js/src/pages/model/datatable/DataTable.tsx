import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DataGrid, DataGridColumnVisibility, useDataGrid, KeenIcon } from '@/components';
import axios from 'axios';
import { ModelContentProps } from '../_models';
import { generateColumns } from '../_helper';
import { CreateModal } from '../form/CreateModal';

const DataTable = ({ data }: ModelContentProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const handleClose = () => {
    setCreateModalOpen(false);
  };
  const columns = useMemo(() => {
    const cols = generateColumns(data.config.grid, data.config.relationships);

    // Add Action Buttons with fixed positioning on large screens
    cols.push(
      {
        id: 'edit',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => alert(`Clicked on edit for ${row.original.name}`)}
          >
            <KeenIcon icon="notepad-edit" />
          </button>
        ),
        meta: {
          headerClassName: 'w-[60px] lg:sticky lg:right-[60px] bg-white z-10',
          cellClassName: 'w-[60px] lg:sticky lg:right-[60px] bg-white z-10'
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
          headerClassName: 'w-[60px] lg:sticky lg:right-0 bg-white z-10',
          cellClassName: 'w-[60px] lg:sticky lg:right-0 bg-white z-10'
        }
      }
    );

    return cols;
  }, []);

  const fetchProducts = async (params: any) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(params.pageIndex + 1));
      queryParams.set('per_page', String(params.pageSize));
      if (params.sorting?.[0]?.id) {
        queryParams.set('sort_by', params.sorting[0].id);
        queryParams.set('sort_dir', params.sorting[0].desc ? 'desc' : 'asc');
      }
      if (params.columnFilters.length > 0) {
        var values: string[] = [];
        params.columnFilters.forEach((filter: any) => {
          values.push(`${filter.id}:${filter.value}`);
        });
        queryParams.set(`filter`, values.join('|'));
      }
      if (params.querySearch.length > 0) {
        queryParams.set('search', params.querySearch);
      }
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/${data.slug}?${queryParams.toString()}`
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
        await axios.delete(`${import.meta.env.VITE_APP_API_URL}/${data.slug}/${id}`);
        toast.success('Record deleted successfully');
      } catch (error) {
        toast.error('Error deleting record');
      }
    }
  };

  const Toolbar = () => {
    const { table, setQuerySearch } = useDataGrid();

    const [searchQuery, setSearchQuery] = useState('');
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      table.setPageIndex(0);
      setSearchQuery(value);
      setQuerySearch(value);
    };
    return (
      <div className="card-header border-b-0 px-5 flex-wrap">
        <h3 className="card-title font-medium text-sm">
          Showing {table.getRowCount()} of xxxx {data?.slug}s
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
                  placeholder={`Search ${data.title}`}
                  className="input ps-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <DataGridColumnVisibility table={table} hideTitle={true} />
          </div>
          <button className="btn btn-md btn-primary" onClick={() => setCreateModalOpen(true)}>
            Add {data.title}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <CreateModal open={createModalOpen} data={data} onOpenChange={handleClose} />
      <DataGrid
        columns={columns}
        serverSide={true}
        onFetchData={fetchProducts}
        rowSelection={true}
        getRowId={(row: { id: string }) => row.id}
        pagination={{ size: 10 }}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { DataTable };
