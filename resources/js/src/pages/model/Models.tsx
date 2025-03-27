import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  DataGrid,
  DataGridColumnVisibility,
  useDataGrid,
  KeenIcon,
  DataGridColumnHeader,
  DataGridRowSelectAll,
  DataGridRowSelect
} from '@/components';
import axios from 'axios';
import { Model } from './_models';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { CreateModel } from './CreateModel';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

interface IColumnFilterProps<TData, TValue> {
  column: {
    getFilterValue: () => TValue;
    setFilterValue: (value: TValue) => void;
  };
}

const Models = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<Model | null>(null);
  const handleClose = () => {
    setCreateModalOpen(false);
  };
  const ColumnInputFilter = <TData, TValue>({ column }: IColumnFilterProps<TData, TValue>) => {
    return (
      <Input
        placeholder="Filter..."
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(event: any) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };
  const columns = useMemo<ColumnDef<Model>[]>(
    () => [
      {
        accessorKey: 'id',
        header: () => <DataGridRowSelectAll />,
        enableSorting: true,
        enableHiding: false,
        cell: (info) => <DataGridRowSelect row={info.row} />,
        meta: {
          headerClassName: 'w-[80px] text-left',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Name"
            filter={<ColumnInputFilter column={column} />}
            column={column}
          />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium">{info.row.original.name}</span>
            <a
              href={`/api/${info.row.original.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              /api/{info.row.original.slug}
            </a>
          </div>
        ),
        meta: {
          headerClassName: 'min-w-[200px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorKey: 'title',
        header: 'Title & Description',
        enableSorting: true,
        cell: (info) => (
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium">{info.row.original.title}</span>
            <span className="text-sm text-gray-500">
              {info.row.original.desc || 'No description available'}
            </span>
          </div>
        ),
        meta: {
          headerClassName: 'min-w-[250px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorKey: 'table',
        header: 'Table & Key',
        enableSorting: true,
        cell: (info) => (
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium">{info.row.original.table}</span>
            <span className="text-sm text-gray-500">Key: {info.row.original.key}</span>
          </div>
        ),
        meta: {
          headerClassName: 'min-w-[200px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.auth,
        id: 'auth',
        header: 'Auth Required',
        enableSorting: false,
        cell: ({ row }) => {
          const userSwitch = row.original.auth; // Har bir foydalanuvchining switch holati
          return (
            <div className="flex items-center mb-2">
              <label className="switch switch-sm">
                <input
                  type="checkbox"
                  checked={userSwitch}
                  onChange={() => handleToggle(row.index)} // Use row.index for the correct user
                />
                <span className="slider round"></span>
              </label>
            </div>
          );
        },
        meta: {
          className: 'min-w-[100px]'
        }
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        enableSorting: true,
        cell: (info) => new Date(info.row.original.created_at).toLocaleString(),
        meta: {
          headerClassName: 'min-w-[200px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        id: 'detail',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <Link
            className="btn btn-sm btn-icon btn-clear btn-light"
            to={`/apitoolz/model/${row.original.slug}`}
          >
            <KeenIcon icon="eye" />
          </Link>
        ),
        meta: {
          headerClassName: 'w-[60px] lg:sticky lg:right-[60px] bg-white z-10',
          cellClassName: 'w-[60px] lg:sticky lg:right-[60px] bg-white z-10'
        }
      },
      {
        id: 'delete',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => {
              setDeleteData(row.original);
              setDeleteModalOpen(true);
            }}
          >
            <KeenIcon icon="trash" />
          </button>
        ),
        meta: {
          headerClassName: 'w-[60px] lg:sticky lg:right-0 bg-white z-10',
          cellClassName: 'w-[60px] lg:sticky lg:right-0 bg-white z-10'
        }
      }
    ],
    []
  );

  const handleDelete = (deleteTable: boolean, data: Model) => {
    if (deleteTable) {
      handleDeleteClick('delete-table', data);
    } else {
      handleDeleteClick('undelete-table', data);
    }
  };

  const handleToggle = (index: number) => {
    // setUsers((prevUsers) => {
    //   const updatedUsers = [...prevUsers];
    //   updatedUsers[index] = {
    //     ...updatedUsers[index],
    //     switch: !updatedUsers[index].switch // Toggle the switch state
    //   };
    //   return updatedUsers;
    // });
  };

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
        var values: string[] = [];
        params.columnFilters.forEach((filter: any) => {
          values.push(`${filter.id}:${filter.value}`);
        });
        queryParams.set(`filter`, values.join('|'));
      }
      if (params.querySearch.length > 0) {
        queryParams.set('search', params.querySearch);
      }
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/model`);
      return {
        data: response.data.data,
        totalCount: response.data.meta.total
      };
    } catch (error) {
      toast.error('Error fetching data');
      return { data: [], totalCount: 0 };
    }
  };

  const handleDeleteClick = async (deleteTable: string, model: Model) => {
    try {
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/model/${model.slug}/${deleteTable}`);
      toast.success(`${model.title} deleted successfully`);
    } catch (error) {
      toast.error('Error deleting record');
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
        <h3 className="card-title">Models</h3>
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
                  placeholder={`Search Models`}
                  className="input ps-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <DataGridColumnVisibility table={table} hideTitle={true} />
          </div>
          <button className="btn btn-md btn-primary" onClick={() => setCreateModalOpen(true)}>
            Create New Model
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <ConfirmDeleteDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        data={deleteData}
        onDelete={handleDelete}
      />
      <CreateModel open={createModalOpen} onOpenChange={handleClose} />
      <DataGrid
        columns={columns}
        serverSide={true}
        onFetchData={fetchModels}
        rowSelection={true}
        getRowId={(row: { id: string }) => row.id}
        pagination={{ size: 10 }}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Models };
