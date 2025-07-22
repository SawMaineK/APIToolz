import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  DataGrid,
  useDataGrid,
  KeenIcon,
  DataGridRowSelectAll,
  DataGridRowSelect
} from '@/components';
import axios from 'axios';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { Link, useNavigate } from 'react-router-dom';
import { CreateRoleModal } from './CreateRoleModal';
import { UpdateRoleModal } from './UpdateRoleModal';

const Roles = () => {
  const [role, setRole] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const handleClose = () => {
    setCreateModalOpen(false);
    setUpdateModalOpen(false);
  };

  const columns = useMemo(() => {
    const cols = [
      {
        id: 'id',
        header: <DataGridRowSelectAll />,
        accessorKey: 'id',
        cell: ({ row }: any) => <DataGridRowSelect row={row} />,
        meta: {
          headerClassName: 'w-[60px]'
        }
      },
      {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }: any) => <span>{row.original.name}</span>
      },
      {
        id: 'guard_name',
        header: 'Guard Name',
        accessorKey: 'guard_name',
        cell: ({ row }: any) => <span>{row.original.guard_name}</span>,
        meta: {
          headerClassName: 'w-[200px]',
          cellClassName: 'w-[200px]'
        }
      },
      {
        id: 'created_at',
        header: 'Created At',
        accessorKey: 'created_at',
        cell: ({ row }: any) => (
          <span>{new Date(row.original.created_at).toLocaleString() || 'N/A'}</span>
        ),
        meta: {
          headerClassName: 'w-[200px]',
          cellClassName: 'w-[200px]'
        }
      },
      {
        id: 'permission',
        header: () => '',
        enableSorting: false,
        cell: ({ row }: any) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => {
              navigate(`/admin/permission/${row.original.id}`, {
                state: {
                  role: row.original
                }
              });
            }}
          >
            <KeenIcon icon="key" />
          </button>
        ),
        meta: {
          headerClassName: 'w-[60px] lg:sticky lg:right-[60px] z-1',
          cellClassName: 'w-[60px] lg:sticky lg:right-[60px] z-1'
        }
      },
      {
        id: 'delete',
        header: () => '',
        enableSorting: false,
        cell: ({ row }: any) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => handleDeleteClick(row.original.id)}
          >
            <KeenIcon icon="trash" />
          </button>
        ),
        meta: {
          headerClassName: 'w-[60px] lg:sticky lg:right-0 z-1',
          cellClassName: 'w-[60px] lg:sticky lg:right-0 z-1'
        }
      }
    ];

    return cols;
  }, []);

  const fetchRoles = async (params: any) => {
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
        `${import.meta.env.VITE_APP_API_URL}/role?${queryParams.toString()}`
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
        await axios.delete(`${import.meta.env.VITE_APP_API_URL}/role/${id}`);
        toast.success('Record deleted successfully');
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        toast.error('Error deleting record');
      }
    }
  };

  const Filters = () => {
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
        <h3 className="card-title font-medium text-sm">Filter by:</h3>
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
                  placeholder={`Search Roles`}
                  className="input input-sm ps-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const onCreated = () => {
    handleClose();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Roles" />
          <ToolbarDescription>Manage all roles</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Link to={'/account/home/get-started'} className="btn btn-sm btn-light">
            <KeenIcon icon="exit-down" className="!text-base" />
            Export
          </Link>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setRole(null);
              setCreateModalOpen(true);
            }}
          >
            <KeenIcon icon="plus" />
            Add Role
          </button>
        </ToolbarActions>
      </Toolbar>
      <UpdateRoleModal
        open={updateModalOpen}
        data={role}
        onCreated={onCreated}
        onOpenChange={handleClose}
      />
      <CreateRoleModal open={createModalOpen} onCreated={onCreated} onOpenChange={handleClose} />
      <DataGrid
        key={refreshKey}
        columns={columns}
        serverSide={true}
        onFetchData={fetchRoles}
        rowSelection={true}
        getRowId={(row: { id: string }) => row.id}
        pagination={{ size: 10 }}
        toolbar={<Filters />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Roles };
