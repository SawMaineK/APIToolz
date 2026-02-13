import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DataGrid, KeenIcon } from '@/components';
import axios from 'axios';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { ChartNoAxesCombined, Download, Trash } from 'lucide-react';
import { ModelContentProps } from '../_models';
import { generateColumns } from '../_helper';
import { CreateModal } from '../form/CreateModal';
import { Link, useNavigate } from 'react-router-dom';
import { DataTableFilter } from './DataTableFilter';
import { SummaryWidgetCard } from '../summary/SummaryWidgetCard';
import { format } from 'date-fns';
import { useAuthContext } from '@/auth';
import { cn } from '@/lib/utils';

const DataTable = ({ model }: ModelContentProps) => {
  const [modelData, setModelData] = useState(null);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const lastQueryParamsRef = useRef<URLSearchParams>(new URLSearchParams());
  const { currentUser } = useAuthContext();
  const canEdit = currentUser?.permissions?.some((perm) => perm === 'edit');
  const canDelete = currentUser?.permissions?.some((perm) => perm === 'delete');
  const canCreate = currentUser?.permissions?.some((perm) => perm === 'create');
  const canView = currentUser?.permissions?.some((perm) => perm === 'view');
  const navigate = useNavigate();

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
    setModelData(null);
    setCreateModalOpen(false);
    setSelectedIds([]);
    setWidgets([]);
    if (canView && model.config.reports?.filter((report) => report.type == 'kpi').length > 0) {
      fetchSummaryWidgets(model.slug);
    }
  }, [model]);

  const columns = useMemo(() => {
    const cols = generateColumns(model.config.grid, model.config.forms, model.config.relationships);

    if (canEdit) {
      cols.push({
        id: 'edit',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => {
              navigate(`/admin/model/${model.slug}/update`, {
                state: {
                  modelData: row.original
                }
              });
            }}
          >
            <KeenIcon icon="notepad-edit" />
          </button>
        ),
        meta: {
          headerClassName: cn(
            'w-[60px] lg:sticky bg-white dark:bg-[--tw-page-bg-dark] z-1',
            canDelete ? 'lg:right-[60px]' : 'lg:right-0' // ✅ Shift to right-0 if delete is missing
          ),
          cellClassName: cn(
            'w-[60px] lg:sticky bg-white dark:bg-[--tw-page-bg-dark] z-1',
            canDelete ? 'lg:right-[60px]' : 'lg:right-0'
          )
        }
      });
    }

    if (canDelete) {
      cols.push({
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
      });
    }

    return cols;
  }, [model, currentUser]);

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
      lastQueryParamsRef.current = new URLSearchParams(queryParams.toString());

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

  const fetchSummaryWidgets = async (modelId: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/${modelId}/summary`);
      setWidgets(response.data.reports.filter((item: any) => item.type === 'kpi'));
    } catch (error) {
      console.error('Error fetching model:', error);
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

  const handleBulkDeleteClick = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} record(s)?`)) {
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/${model.slug}/bulk-delete`, {
        ids: selectedIds
      });
      toast.success('Records deleted successfully');
      setSelectedIds([]);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error('Error deleting records');
    }
  };

  const handleExportClick = async () => {
    try {
      const queryParams = new URLSearchParams(lastQueryParamsRef.current.toString());
      queryParams.delete('page');
      queryParams.delete('per_page');

      const fields = model.config.grid
        .filter((column: any) => column.download && !column.hidden)
        .map((column: any) => column.field)
        .join(',');

      if (fields) {
        queryParams.set('fields', fields);
      }

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/${model.slug}/export?${queryParams.toString()}`,
        { responseType: 'blob' }
      );

      const fileBlob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const modelSlug = model.slug.replace(/-/g, '_');
      const fileName = `${modelSlug}_${timestamp}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error exporting data');
    }
  };

  const onCreated = () => {
    setCreateModalOpen(false);
    setRefreshKey((prev) => prev + 1);
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
          {model.config.reports && model.config.reports.length > 0 && (
            <button
              className="btn btn-sm btn-light flex items-center gap-1 whitespace-nowrap"
              onClick={() => {
                navigate(`/admin/model/${model.slug}/summary`);
              }}
            >
              <ChartNoAxesCombined size={16} />
              <span className="truncate max-sm:hidden">Summary</span>
              <span className="sm:hidden">Sum</span>
            </button>
          )}

          {canDelete && model.config.softdelete && (
            <Link
              to={`/admin/model/${model.slug}/trash`}
              className="btn btn-sm btn-light flex items-center gap-1 whitespace-nowrap"
            >
              <Trash size={16} />
              <span className="truncate max-sm:hidden">Trashed</span>
            </Link>
          )}

          <button
            onClick={handleExportClick}
            className="btn btn-sm btn-light flex items-center gap-2 whitespace-nowrap"
          >
            <Download size={16} />
            <span className="truncate max-sm:hidden">Export</span>
            <span className="sm:hidden">CSV</span>
          </button>

          {canDelete && (
            <button
              onClick={handleBulkDeleteClick}
              disabled={selectedIds.length === 0}
              className="btn btn-sm btn-danger flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash size={16} />
              <span className="truncate max-sm:hidden">{`Delete (${selectedIds.length})`}</span>
              <span className="sm:hidden">Delete</span>
            </button>
          )}

          {canCreate && (
            <button
              onClick={() => {
                navigate(`/admin/model/${model.slug}/create`);
              }}
              className="btn btn-sm btn-primary flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]"
              title={`Add ${model?.title || ''}`}
            >
              <KeenIcon icon="plus" />
              <span className="truncate max-sm:hidden">{`Add ${model?.title || ''}`}</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </ToolbarActions>
      </Toolbar>

      {/* ✅ Check for view permission */}
      {!canView ? (
        <div className="p-6 text-center text-gray-500">
          <p>You do not have permission to view this data.</p>
        </div>
      ) : (
        <>
          {widgets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {widgets.slice(0, 4).map((widget: any, i: number) => (
                <SummaryWidgetCard key={i} widget={widget} />
              ))}
            </div>
          )}

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
            toolbar={<DataTableFilter model={model} />}
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
      )}
    </>
  );
};

export { DataTable };
