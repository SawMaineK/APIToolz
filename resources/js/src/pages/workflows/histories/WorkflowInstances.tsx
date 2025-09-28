import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  DataGrid,
  DataGridRowSelectAll,
  DataGridRowSelect,
  KeenIcon,
  Menu,
  MenuItem,
  MenuToggle,
  MenuSub,
  MenuLink,
  MenuIcon,
  MenuTitle,
  MenuSeparator,
  useDataGrid
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
import AsyncSelect from 'react-select/async';
import { Edit, Play, Plus, Trash, View } from 'lucide-react';
import { Workflow } from '../Workflows';
import { useAuthContext } from '@/auth';

interface Props {
  workflowName: string;
  roles: string[];
}

const WorkflowInstances: React.FC<Props> = ({ workflowName, roles }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();

  const columns = useMemo(() => {
    const cols = [
      {
        id: 'id',
        header: <DataGridRowSelectAll />,
        accessorKey: 'id',
        cell: ({ row }: any) => <DataGridRowSelect row={row} />,
        meta: { headerClassName: 'w-[60px]' }
      },
      {
        id: 'workflow_name',
        header: 'Workflow Name',
        accessorKey: 'workflow_name',
        cell: ({ row }: any) => (
          <Link
            to={`/admin/workflow-instances/${row.original.id}`}
            className="font-medium hover:text-primary-active"
          >
            {row.original.workflow_name}
          </Link>
        ),
        meta: { headerClassName: 'w-[260px]', cellClassName: 'w-[260px]' }
      },
      {
        id: 'roles',
        header: 'Assigned Roles',
        accessorKey: 'roles',
        cell: ({ row }: any) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles && row.original.roles.length > 0 ? (
              row.original.roles.map((role: string, index: number) => (
                <span key={index} className="badge badge-sm badge-light badge-outline text-2sm">
                  {role}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm italic">No Roles</span>
            )}
          </div>
        ),
        meta: {
          headerClassName: 'w-[360px]',
          cellClassName: 'w-[360px]'
        }
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: any) => (
          <span
            className={`badge badge-${
              row.original.status === 'completed'
                ? 'success'
                : row.original.status === 'failed'
                  ? 'danger'
                  : 'warning'
            } shrink-0 badge-outline rounded-[30px]`}
          >
            {row.original.status}
          </span>
        ),
        meta: { headerClassName: 'w-[120px]', cellClassName: 'w-[120px]' }
      },
      {
        id: 'current_step_label',
        header: 'Current Step',
        accessorKey: 'current_step_label',
        cell: ({ row }: any) => <span>{row.original.current_step_label}</span>,
        meta: { headerClassName: 'w-[180px]', cellClassName: 'w-[180px]' }
      },
      {
        id: 'priority',
        header: 'Priority',
        accessorKey: 'priority',
        cell: ({ row }: any) => (
          <span
            className={`badge badge-${
              row.original.priority === 'high' || row.original.priority === 'urgent'
                ? 'danger'
                : row.original.priority === 'normal'
                  ? 'info'
                  : 'warning'
            } shrink-0 badge-outline rounded-[30px]`}
          >
            {row.original.priority}
          </span>
        ),
        meta: { headerClassName: 'w-[120px]', cellClassName: 'w-[120px]' }
      },
      {
        id: 'completed_at',
        header: 'Completed',
        accessorKey: 'completed_at',
        cell: ({ row }: any) => (
          <span>
            {row.original.completed_at ? new Date(row.original.completed_at).toLocaleString() : '-'}
          </span>
        ),
        meta: { headerClassName: 'w-[150px]', cellClassName: 'w-[150px]' }
      },
      {
        id: 'initiator',
        header: 'Initiator',
        accessorKey: 'initiator',
        cell: ({ row }: any) => <span>{row.original.initiator?.name || '-'}</span>,
        meta: { headerClassName: 'w-[200px]', cellClassName: 'w-[200px]' }
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }: any) => (
          <Menu className="items-stretch">
            <MenuItem
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: 'bottom-end',
                modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
              }}
            >
              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              <MenuSub className="menu-default" rootClassName="w-full max-w-[175px]">
                <MenuItem
                  onClick={() => {
                    navigate(`/admin/workflow/${workflowName}/${row.original.id}`);
                  }}
                >
                  <MenuLink>
                    <MenuIcon>
                      <Edit className="w-4 h-4" />
                    </MenuIcon>
                    <MenuTitle>Edit</MenuTitle>
                  </MenuLink>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate(`/admin/workflow/${row.original.id}/history`);
                  }}
                >
                  <MenuLink>
                    <MenuIcon>
                      <View className="w-4 h-4" />
                    </MenuIcon>
                    <MenuTitle>History</MenuTitle>
                  </MenuLink>
                </MenuItem>
                <MenuSeparator />
                <MenuItem onClick={() => handleDeleteClick(row.original.id)}>
                  <MenuLink className="text-danger flex items-center">
                    <MenuIcon className="text-danger">
                      <Trash className="w-4 h-4" />
                    </MenuIcon>
                    <MenuTitle>
                      <span className="text-danger">Delete</span>
                    </MenuTitle>
                  </MenuLink>
                </MenuItem>
              </MenuSub>
            </MenuItem>
          </Menu>
        ),
        meta: {
          headerClassName: 'w-[60px] lg:sticky lg:right-0 z-1',
          cellClassName: 'w-[60px] lg:sticky lg:right-0 z-1'
        }
      }
    ];
    return cols;
  }, []);

  const fetchInstances = async (params: any) => {
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
        params.columnFilters.forEach((filter: any) => values.push(`${filter.id}:${filter.value}`));
        queryParams.set(`filter`, values.join('|'));
      }
      if (params.querySearch.length > 0) {
        queryParams.set('search', params.querySearch);
      }
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/workflows/${workflowName}/instances?${queryParams.toString()}`
      );
      return {
        data: response.data.data,
        totalCount: response.data.meta.total
      };
    } catch (error) {
      toast.error('Error fetching workflow instances');
      return { data: [], totalCount: 0 };
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workflow instance?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_APP_API_URL}/workflow-instances/${id}`);
        toast.success('Workflow instance deleted');
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        toast.error('Error deleting instance');
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
                  placeholder="Search Workflow"
                  className="input ps-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="w-48">
                <AsyncSelect
                  isClearable
                  classNamePrefix="form-select"
                  placeholder="Filter by Status"
                  styles={styles}
                  defaultOptions={[
                    { label: 'Draft', value: 'draft' },
                    { label: 'In Progress', value: 'in_progress' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Rejected', value: 'rejected' }
                  ]}
                  onChange={(selectedOption: any) => {
                    const value = selectedOption ? selectedOption.value : '';
                    table.setPageIndex(0);
                    table.setColumnFilters((old) =>
                      value
                        ? [...old.filter((f: any) => f.id !== 'status'), { id: 'status', value }]
                        : old.filter((f: any) => f.id !== 'status')
                    );
                  }}
                />
              </div>
              <div className="w-48">
                <AsyncSelect
                  isClearable
                  classNamePrefix="form-select"
                  placeholder="Filter by Priority"
                  styles={styles}
                  defaultOptions={[
                    { label: 'Low', value: 'low' },
                    { label: 'Normal', value: 'normal' },
                    { label: 'High', value: 'high' },
                    { label: 'Urgent', value: 'urgent' }
                  ]}
                  onChange={(selectedOption: any) => {
                    const value = selectedOption ? selectedOption.value : '';
                    table.setPageIndex(0);
                    table.setColumnFilters((old) =>
                      value
                        ? [
                            ...old.filter((f: any) => f.id !== 'priority'),
                            { id: 'priority', value }
                          ]
                        : old.filter((f: any) => f.id !== 'priority')
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasRoleAccess = (): boolean => {
    const userRoles = currentUser?.roles ?? [];
    return userRoles.some((role: string) => roles.includes(role));
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Workflow Instances" />
          <ToolbarDescription>Track and manage workflow instances</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          {hasRoleAccess() && (
            <button
              onClick={() => navigate(`/admin/workflow/${workflowName}`)}
              className="btn btn-primary"
            >
              <Play className="w-4 h-4" /> Start Workflow
            </button>
          )}
        </ToolbarActions>
      </Toolbar>
      <div className="mt-8">
        <DataGrid
          key={refreshKey}
          columns={columns}
          serverSide={true}
          onFetchData={fetchInstances}
          rowSelection={true}
          getRowId={(row: { id: string }) => row.id}
          pagination={{ size: 10 }}
          toolbar={<Filters />}
          layout={{ card: true }}
        />
      </div>
    </>
  );
};

export { WorkflowInstances };
