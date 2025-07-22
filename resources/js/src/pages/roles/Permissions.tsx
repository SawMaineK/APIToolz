import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DataGrid, useDataGrid, KeenIcon } from '@/components';
import axios from 'axios';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { useLocation } from 'react-router-dom';

const Permissions = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();
  const initialRole = location.state?.role || null;

  const [roleData, setRoleData] = useState<any>(initialRole);
  const [loadingRole, setLoadingRole] = useState(true);

  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const fetchRoleById = async (id: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/role/${id}`);
      const fetchedRole = response.data?.data || response.data;

      setRoleData(fetchedRole);

      const initialPerms = fetchedRole?.permissions?.map((p: any) => p.name) || [];
      setOriginalPermissions(initialPerms);
      setSelectedPermissions(initialPerms);

      setLoadingRole(false);
    } catch (error) {
      toast.error('Failed to fetch role details');
      setLoadingRole(false);
    }
  };

  useEffect(() => {
    if (initialRole?.id) {
      fetchRoleById(initialRole.id);
    } else {
      const searchParams = new URLSearchParams(location.search);
      const idFromQuery = searchParams.get('roleId');
      if (idFromQuery) {
        fetchRoleById(idFromQuery);
      } else {
        toast.error('No role ID found');
        setLoadingRole(false);
      }
    }
  }, []);

  const isDirty = useMemo(() => {
    if (originalPermissions.length !== selectedPermissions.length) return true;
    const sortedOriginal = [...originalPermissions].sort();
    const sortedSelected = [...selectedPermissions].sort();
    return JSON.stringify(sortedOriginal) !== JSON.stringify(sortedSelected);
  }, [originalPermissions, selectedPermissions]);

  const handleToggle = (permissionName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((perm) => perm !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleSaveChanges = async () => {
    if (!roleData?.id) return;
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/role/${roleData.id}/permissions`, {
        permissions: selectedPermissions
      });
      toast.success('Permissions saved successfully');
      setOriginalPermissions([...selectedPermissions]);
    } catch (error) {
      toast.error('Failed to save permissions');
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'role',
        header: 'Role',
        accessorKey: 'role',
        cell: () => <span>{roleData?.name}</span>
      },
      {
        id: 'name',
        header: 'Permission',
        accessorKey: 'name',
        cell: ({ row }: any) => <span>{row.original.name}</span>
      },
      {
        accessorFn: 'action',
        id: 'action',
        header: 'Action',
        enableSorting: false,
        cell: ({ row }: any) => {
          const permissionName = row.original.name;
          const hasPermission = selectedPermissions.includes(permissionName);

          return (
            <div className="flex items-center mb-2">
              <label className="switch switch-sm">
                <input
                  type="checkbox"
                  checked={hasPermission}
                  onChange={() => handleToggle(permissionName)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          );
        },
        meta: { className: 'min-w-[50px]' }
      }
    ],
    [selectedPermissions, roleData]
  );

  // ✅ Fetch all available permissions for listing
  const fetchPermissions = async (params: any) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(params.pageIndex + 1));
      queryParams.set('per_page', String(params.pageSize));
      if (params.sorting?.[0]?.id) {
        queryParams.set('sort_by', params.sorting[0].id);
        queryParams.set('sort_dir', params.sorting[0].desc ? 'desc' : 'asc');
      }
      if (params.columnFilters.length > 0) {
        const values: string[] = [];
        params.columnFilters.forEach((filter: any) => {
          values.push(`${filter.id}:${filter.value}`);
        });
        queryParams.set(`filter`, values.join('|'));
      }
      if (params.querySearch.length > 0) {
        queryParams.set('search', params.querySearch);
      }
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/role/permissions?${queryParams.toString()}`
      );
      return {
        data: response.data,
        totalCount: response.data.length
      };
    } catch (error) {
      toast.error('Error fetching permissions');
      return { data: [], totalCount: 0 };
    }
  };

  // ✅ Filter/Search bar
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
        <h3 className="card-title font-medium text-sm">
          Showing {table.getRowCount()} of {table.getPrePaginationRowModel().rows.length} Permissions
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
                  placeholder={`Search Permissions`}
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

  // ✅ Show loader while fetching role
  if (loadingRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <span>Loading role details...</span>
      </div>
    );
  }

  if (!roleData) {
    return (
      <div className="flex items-center justify-center h-64">
        <span>No role found</span>
      </div>
    );
  }

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Permissions" />
          <ToolbarDescription>Manage permissions for {roleData?.name}</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <button
            className="btn btn-sm btn-primary"
            onClick={handleSaveChanges}
            disabled={!roleData || !isDirty}
          >
            <KeenIcon icon="save" />
            Save Changes
          </button>
        </ToolbarActions>
      </Toolbar>
      <div className="mb-6"></div>
      <DataGrid
        key={refreshKey}
        columns={columns}
        serverSide={true}
        onFetchData={fetchPermissions}
        rowSelection={false}
        getRowId={(row: { id: string }) => row.id}
        pagination={{ size: 10 }}
        toolbar={<Filters />}
        layout={{ card: true }}
      />
    </>
  );
};

export { Permissions };
