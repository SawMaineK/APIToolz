import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  DataGrid,
  DataGridColumnVisibility,
  useDataGrid,
  KeenIcon,
  DataGridRowSelectAll,
  DataGridRowSelect,
  Menu,
  MenuItem,
  MenuToggle,
  MenuSub,
  MenuLink,
  MenuIcon,
  MenuTitle,
  MenuSeparator
} from '@/components';
import axios from 'axios';
import { CreateUserModal } from './CreateUserModal';
import { UpdateUserModal } from './UpdateUserModal';

const Users = () => {
  const [user, setUser] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
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
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <img
              src={
                row.original.avatar
                  ? `${import.meta.env.VITE_APP_IMAGE_URL}/${row.original.avatar}`
                  : '/media/avatars/blank.png'
              }
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <span>{row.original.name}</span>
              <span className="text-sm text-gray-500 block">
                {row.original.roles?.length || 0} Roles
              </span>
            </div>
          </div>
        ),
        meta: {
          headerClassName: 'w-[250px]',
          cellClassName: 'w-[250px]'
        }
      },
      {
        id: 'email',
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }: any) => <span>{row.original.email}</span>,
        meta: {
          headerClassName: 'w-[200px]',
          cellClassName: 'w-[200px]'
        }
      },
      {
        id: 'phone',
        header: 'Phone',
        accessorKey: 'phone',
        cell: ({ row }: any) => <span>{row.original.phone}</span>,
        meta: {
          headerClassName: 'w-[150px]',
          cellClassName: 'w-[150px]'
        }
      },
      {
        id: 'gender',
        header: 'Gender',
        accessorKey: 'gender',
        cell: ({ row }: any) => <span>{row.original.gender || 'N/A'}</span>,
        meta: {
          headerClassName: 'w-[100px]',
          cellClassName: 'w-[100px]'
        }
      },
      {
        id: 'dob',
        header: 'Date of Birth',
        accessorKey: 'dob',
        cell: ({ row }: any) => <span>{row.original.dob || 'N/A'}</span>,
        meta: {
          headerClassName: 'w-[150px]',
          cellClassName: 'w-[150px]'
        }
      },
      {
        id: 'is_2fa_enabled',
        header: '2FA Enabled',
        accessorKey: 'is_2fa_enabled',
        cell: ({ row }: any) => <span>{row.original.is_2fa_enabled ? 'Yes' : 'No'}</span>,
        meta: {
          headerClassName: 'w-[120px]',
          cellClassName: 'w-[120px]'
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
          headerClassName: 'w-[150px]',
          cellClassName: 'w-[150px]'
        }
      },
      {
        id: 'roles',
        header: () => '',
        enableSorting: false,
        cell: ({ row }: any) => (
          <Menu className="items-stretch">
            <MenuItem
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: 'bottom-end',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 10] // [skid, distance]
                    }
                  }
                ]
              }}
            >
              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              <MenuSub className="menu-default" rootClassName="w-full max-w-[175px]">
                <MenuItem
                  onClick={() => {
                    setUser(row.original);
                    setUpdateModalOpen(true);
                  }}
                >
                  <MenuLink>
                    <MenuIcon>
                      <KeenIcon icon="notepad-edit" />
                    </MenuIcon>
                    <MenuTitle>Edit</MenuTitle>
                  </MenuLink>
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  path="#"
                  onClick={() => {
                    setUser(row.original);
                  }}
                >
                  <MenuLink>
                    <MenuIcon>
                      <KeenIcon icon="security-user" />
                    </MenuIcon>
                    <MenuTitle>Roles</MenuTitle>
                  </MenuLink>
                </MenuItem>
                <MenuItem path="#">
                  <MenuLink>
                    <MenuIcon>
                      <KeenIcon icon="key-square" />
                    </MenuIcon>
                    <MenuTitle>Permissions</MenuTitle>
                  </MenuLink>
                </MenuItem>
              </MenuSub>
            </MenuItem>
          </Menu>
        ),
        meta: {
          headerClassName: 'w-[60px] lg:sticky lg:right-[60px] bg-white z-1',
          cellClassName: 'w-[60px] lg:sticky lg:right-[60px] bg-white z-1'
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
          headerClassName: 'w-[60px] lg:sticky lg:right-0 bg-white z-1',
          cellClassName: 'w-[60px] lg:sticky lg:right-0 bg-white z-1'
        }
      }
    ];

    return cols;
  }, []);

  const fetchUsers = async (params: any) => {
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
        `${import.meta.env.VITE_APP_API_URL}/users?${queryParams.toString()}`
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
        await axios.delete(`${import.meta.env.VITE_APP_API_URL}/users/${id}`);
        toast.success('Record deleted successfully');
        setRefreshKey((prev) => prev + 1);
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
          Showing {table.getRowCount()} of {table.getPrePaginationRowModel().rows.length} Users
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
                  placeholder={`Search Users`}
                  className="input ps-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <DataGridColumnVisibility table={table} hideTitle={true} />
          </div>
          <button
            className="btn btn-md btn-primary"
            onClick={() => {
              setUser(null);
              setCreateModalOpen(true);
            }}
          >
            <KeenIcon icon="plus" className="me-2" />
            Add User
          </button>
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
      <UpdateUserModal
        open={updateModalOpen}
        data={user}
        onCreated={onCreated}
        onOpenChange={handleClose}
      />
      <CreateUserModal open={createModalOpen} onCreated={onCreated} onOpenChange={handleClose} />
      <DataGrid
        key={refreshKey}
        columns={columns}
        serverSide={true}
        onFetchData={fetchUsers}
        rowSelection={true}
        getRowId={(row: { id: string }) => row.id}
        pagination={{ size: 10 }}
        toolbar={<Toolbar />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Users };
