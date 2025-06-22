import { useEffect, useMemo, useState } from 'react';
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
import { Menu, MenuItem, MenuToggle } from '@/components';
import { ChartNoAxesCombined, Cpu } from 'lucide-react';
import { DropdownChatAI } from '@/partials/dropdowns/chat-ai';
import { ModelContentProps } from '../_models';
import { generateColumns } from '../_helper';
import { CreateModal } from '../form/CreateModal';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n';
import { useRef } from 'react';
import { DataTableFilter } from './DataTableFilter';
import { report } from 'process';
import { SummaryWidgetCard } from '../summary/SummaryWidgetCard';
import { format } from 'date-fns';

const DataTable = ({ model }: ModelContentProps) => {
  const [modelData, setModelData] = useState(null);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const { isRTL } = useLanguage();

  const itemAIChatRef = useRef<any>(null);

  const handleShow = () => {
    window.dispatchEvent(new Event('resize'));
  };

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
    setModelData(null);
    setCreateModalOpen(false);
    setWidgets([]);
    if (model.config.reports?.filter((report) => report.type == 'kpi').length > 0) {
      fetchSummaryWidgets(model.slug);
    }
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
          <Menu>
            <MenuItem
              ref={itemAIChatRef}
              onShow={handleShow}
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? 'bottom-start' : 'bottom-end',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: isRTL() ? [-170, 10] : [50, -100]
                    }
                  }
                ]
              }}
            >
              <MenuToggle className="btn btn-sm btn-light flex items-center gap-1 whitespace-nowrap">
                <Cpu size={16} />
                <span className="truncate max-sm:hidden">AI Assist</span>
                <span className="sm:hidden">AI</span>
              </MenuToggle>

              {DropdownChatAI({ menuTtemRef: itemAIChatRef, slug: model.slug, type: 'response' })}
            </MenuItem>
          </Menu>

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
        </ToolbarActions>
      </Toolbar>

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
  );
};

export { DataTable };
