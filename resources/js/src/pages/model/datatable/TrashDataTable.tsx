import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DataGrid } from '@/components';
import axios from 'axios';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { ModelContentProps } from '../_models';
import { generateColumns } from '../_helper';
import { format } from 'date-fns';
import { Trash2, Undo2 } from 'lucide-react';
import { TrashDataTableFilter } from './TrashDataTableFilter';
import { useAuthContext } from '@/auth';

const TrashDataTable = ({ model }: ModelContentProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { currentUser } = useAuthContext();
  const canDelete = currentUser?.permissions?.some((perm) => perm === 'delete');

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
    setSelectedIds([]);
  }, [model]);

  const columns = useMemo(() => {
    const cols = generateColumns(model.config.grid, model.config.forms, model.config.relationships);
    if (canDelete) {
      cols.push(
        {
          id: 'restore',
          header: () => '',
          enableSorting: false,
          cell: ({ row }) => (
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() => handleRestoreClick(row.original.id)}
            >
              <Undo2 size={18} className="text-base" />
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
              <Trash2 size={18} className="text-danger" />
            </button>
          ),
          meta: {
            headerClassName:
              'w-[60px] lg:sticky lg:right-0 bg-white dark:bg-[--tw-page-bg-dark] z-1',
            cellClassName: 'w-[60px] lg:sticky lg:right-0 bg-white dark:bg-[--tw-page-bg-dark] z-1'
          }
        }
      );
    }

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
        const values = params.columnFilters.map((f: any) => {
          if (f.value && typeof f.value === 'object' && f.value.from && f.value.to) {
            const start_date = f.value?.from ? format(f.value.from, 'yyyy-MM-dd') : '';
            const end_date = f.value?.to
              ? format(new Date(f.value.to.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
              : '';
            return `${f.id}:between:${start_date},${end_date}`;
          }
          return `${f.id}:${f.value}`;
        });
        queryParams.set(`filter`, values.join('|'));
      }
      if (params.querySearch.length > 0) {
        queryParams.set('search', params.querySearch);
      }
      queryParams.set('only_trashed', 'true');
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
    if (
      window.confirm(
        'Are you sure you want to permanently delete this record? This action cannot be undo.'
      )
    ) {
      try {
        await axios.delete(`${import.meta.env.VITE_APP_API_URL}/${model.slug}/${id}/force-delete`);
        toast.success('Record permanently deleted successfully');
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        toast.error('Error deleting record');
      }
    }
  };

  const handleRestoreClick = async (id: string) => {
    if (window.confirm('Are you sure you want to restore this record?')) {
      try {
        await axios.put(`${import.meta.env.VITE_APP_API_URL}/${model.slug}/${id}/restore`);
        toast.success('Record restored successfully');
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        toast.error('Error restored record');
      }
    }
  };

  const handleBulkRestoreClick = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to restore ${selectedIds.length} record(s)?`)) {
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/${model.slug}/bulk-restore`, {
        ids: selectedIds
      });
      toast.success('Records restored successfully');
      setSelectedIds([]);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error('Error restoring records');
    }
  };

  const handleBulkForceDeleteClick = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${selectedIds.length} record(s)? This action cannot be undo.`
      )
    ) {
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/${model.slug}/bulk-force-delete`, {
        ids: selectedIds
      });
      toast.success('Records permanently deleted successfully');
      setSelectedIds([]);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error('Error deleting records');
    }
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text={`Deleted ${model?.title || ''}`} />
          <ToolbarDescription>
            {model?.desc || `Manage all your deleted ${model?.slug || ''}`}
          </ToolbarDescription>
        </ToolbarHeading>
        {canDelete && (
          <ToolbarActions>
            <button
              onClick={handleBulkRestoreClick}
              disabled={selectedIds.length === 0}
              className="btn btn-sm btn-light flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo2 size={16} />
              <span className="truncate max-sm:hidden">{`Restore Selected (${selectedIds.length})`}</span>
              <span className="sm:hidden">Restore</span>
            </button>

            <button
              onClick={handleBulkForceDeleteClick}
              disabled={selectedIds.length === 0}
              className="btn btn-sm btn-danger flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              <span className="truncate max-sm:hidden">{`Delete Selected (${selectedIds.length})`}</span>
              <span className="sm:hidden">Delete</span>
            </button>
          </ToolbarActions>
        )}
      </Toolbar>
      <div className="mb-6"></div>
      <DataGrid
        key={refreshKey}
        columns={columns}
        serverSide={true}
        onFetchData={fetchModels}
        rowSelection={true}
        getRowId={(row: { id: string }) => row.id}
        onRowSelectionChange={(state) => {
          const ids = Object.keys(state).filter((id) => state[id]);
          setSelectedIds(ids);
        }}
        pagination={{ size: 10 }}
        toolbar={<TrashDataTableFilter model={model} />}
        layout={{ card: true }}
      />
    </>
  );
};

export { TrashDataTable };
