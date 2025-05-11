import React, { useEffect, useMemo, useState } from 'react';
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
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { Link } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
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
          <div className="flex items-center gap-4">
            <img
              src={
                row.original.avatar
                  ? `${import.meta.env.VITE_APP_IMAGE_URL}/${row.original.avatar}`
                  : '/media/avatars/blank.png'
              }
              className="rounded-full size-9 shrink-0"
              alt={`${row.original.name}`}
            />

            <div className="flex flex-col gap-0.5">
              <Link
                to="#"
                className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px"
              >
                {row.original.name}
              </Link>

              <Link to="#" className="text-2sm text-gray-700 font-normal hover:text-primary-active">
                {row.original.email}
              </Link>
            </div>
          </div>
        ),
        meta: {
          headerClassName: 'w-[300px]',
          cellClassName: 'w-[300px]'
        }
      },
      {
        id: 'roles',
        header: 'Roles',
        accessorKey: 'roles',
        cell: ({ row }: any) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.map((item: any) => {
              return (
                <button
                  key={item.id}
                  className="btn btn-sm btn-light btn-active btn-outline text-2sm"
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        ),
        meta: {
          headerClassName: 'w-[360px]',
          cellClassName: 'w-[360px]'
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
        id: 'is_2fa_enabled',
        header: '2FA Enabled',
        accessorKey: 'is_2fa_enabled',
        cell: ({ row }: any) => (
          <span
            className={`badge badge-${row.original.is_2fa_enabled ? 'success' : 'danger'} shrink-0 badge-outline rounded-[30px]`}
          >
            <span
              className={`size-1.5 rounded-full bg-${row.original.is_2fa_enabled ? 'success' : 'danger'} me-1.5`}
            ></span>
            {row.original.is_2fa_enabled ? 'Enabled' : 'Disabled'}
          </span>
        ),
        meta: {
          headerClassName: 'w-[120px]',
          cellClassName: 'w-[120px]'
        }
      },
      {
        id: 'is_active',
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ row }: any) => (
          <span
            className={`badge badge-${row.original.is_active ? 'success' : 'danger'} shrink-0 badge-outline rounded-[30px]`}
          >
            <span
              className={`size-1.5 rounded-full bg-${row.original.is_active ? 'success' : 'danger'} me-1.5`}
            ></span>
            {row.original.is_active ? 'Active' : 'Inactive'}
          </span>
        ),
        meta: {
          headerClassName: 'w-[120px]',
          cellClassName: 'w-[120px]'
        }
      },
      {
        id: 'last_activity',
        header: 'Last Activity',
        accessorKey: 'last_activity',
        cell: ({ row }: any) => (
          <span>
            {row.original.last_activity
              ? new Date(row.original.last_activity).toLocaleString()
              : 'N/A'}
          </span>
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

  const [roles, setRoles] = useState([] as any[]);
  const loadOptions = async (inputValue: any) => {
    try {
      const url = inputValue
        ? `${import.meta.env.VITE_APP_API_URL}/role?search=${inputValue}`
        : `${import.meta.env.VITE_APP_API_URL}/role`;
      return await axios.get(url).then(({ data }) => {
        return data.data.map((item: any) => ({
          label: item['name'],
          value: item['id']
        }));
      });
    } catch (error) {
      toast.error('Error loading filter options');
      return [];
    }
  };
  useEffect(() => {
    loadOptions('').then((data) => {
      setRoles(data);
    });
  }, []);

  const Filters = () => {
    const { table, setQuerySearch } = useDataGrid();

    const [searchQuery, setSearchQuery] = useState('');
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      table.setPageIndex(0);
      setSearchQuery(value);
      setQuerySearch(value);
    };
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
    const filterCols = (old: any, key: string, value: any) => {
      const filterIndex = old.findIndex((f: any) => f.id === key);
      if (filterIndex > -1) {
        if (value === '') {
          return old.filter((f: any) => f.id !== key);
        } else {
          const newFilters = [...old];
          newFilters[filterIndex].value = value;
          return newFilters;
        }
      } else {
        return value === '' ? old : [...old, { id: key, value }];
      }
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
              <div className="w-48">
                <AsyncSelect
                  isClearable
                  classNamePrefix="form-select"
                  placeholder={`Filter by Roles`}
                  styles={styles}
                  defaultOptions={roles}
                  loadOptions={(inputValue) => loadOptions(inputValue)}
                  onChange={(selectedOption: any) => {
                    const value = selectedOption ? selectedOption.label : '';
                    table.setPageIndex(0);
                    table.setColumnFilters((old) => filterCols(old, 'role', value));
                  }}
                />
              </div>
              <div className="w-48">
                <AsyncSelect
                  isClearable
                  classNamePrefix="form-select"
                  placeholder={`Filter by Status`}
                  styles={styles}
                  defaultOptions={[
                    { label: 'Active', value: '1' },
                    { label: 'Inactive', value: '0' }
                  ]}
                  onChange={(selectedOption: any) => {
                    const value = selectedOption ? selectedOption.value : '';
                    table.setPageIndex(0);
                    table.setColumnFilters((old) => filterCols(old, 'is_active', value));
                  }}
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
          <ToolbarPageTitle text="Users" />
          <ToolbarDescription>Manage all users</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Link to={'/account/home/get-started'} className="btn btn-sm btn-light">
            <KeenIcon icon="exit-down" className="!text-base" />
            Export
          </Link>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setUser(null);
              setCreateModalOpen(true);
            }}
          >
            <KeenIcon icon="plus" />
            Add User
          </button>
        </ToolbarActions>
      </Toolbar>
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
        toolbar={<Filters />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Users };
