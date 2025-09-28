import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  FileText,
  File,
  FileImage,
  FileSpreadsheet,
  FileCode,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  XCircle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { toAbsoluteUrl } from '@/utils';
import { useAuthContext } from '@/auth';

interface WorkflowHistoryProps {
  workflowInstanceId: string;
}

const fileTypeIcon = (type: string | undefined) => {
  if (!type) return { icon: File, color: 'text-gray-400' };
  if (type.includes('pdf')) return { icon: FileText, color: 'text-red-500' };
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv'))
    return { icon: FileSpreadsheet, color: 'text-green-500' };
  if (type.includes('word')) return { icon: FileText, color: 'text-blue-500' };
  if (type.includes('image')) return { icon: FileImage, color: 'text-yellow-500' };
  return { icon: FileCode, color: 'text-gray-400' };
};

const formatFileSize = (size: number | string) => {
  const s = Number(size);
  if (s < 1024) return `${s} B`;
  if (s < 1024 * 1024) return `${(s / 1024).toFixed(1)} KB`;
  return `${(s / 1024 / 1024).toFixed(1)} MB`;
};

const statusColor = (status: string | null) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-blue-500';
    case 'failed':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

export const WorkflowHistory = ({ workflowInstanceId }: WorkflowHistoryProps) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [editingComment, setEditingComment] = useState<Record<number, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const { currentUser } = useAuthContext();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/workflows/instance/${workflowInstanceId}`
        );
        setHistory(res.data?.steps || []);
      } catch (err) {
        console.error('Error fetching workflow history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [workflowInstanceId]);

  const toggleStep = (id: number) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditComment = (stepId: number, current: string) => {
    setEditingComment((prev) => ({ ...prev, [stepId]: true }));
    setCommentDrafts((prev) => ({ ...prev, [stepId]: current || '' }));
  };

  const handleCancelEdit = (stepId: number) => {
    setEditingComment((prev) => ({ ...prev, [stepId]: false }));
    setCommentDrafts((prev) => ({ ...prev, [stepId]: '' }));
  };

  const handleSaveComment = async (stepId: number) => {
    try {
      const comment = commentDrafts[stepId];
      await axios.put(`${import.meta.env.VITE_APP_API_URL}/workflows/steps/${stepId}/comment`, {
        comment
      });
      setHistory((prev) => prev.map((s) => (s.id === stepId ? { ...s, comment } : s)));
      setEditingComment((prev) => ({ ...prev, [stepId]: false }));
    } catch (err) {
      console.error('Error saving comment', err);
    }
  };

  const canEdit = (step: any) => {
    // allow owner of the step or roles like 'admin','super'
    return (
      step?.actor?.id === currentUser?.id ||
      currentUser?.roles?.includes('admin') ||
      currentUser?.roles?.includes('super')
    );
  };

  const renderFilesGrid = (files: any[] | any) => {
    const fileList = Array.isArray(files) ? files : [files];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
        {fileList.map((file: any, idx: number) => {
          const url = file?.url?.replace(/\\/g, '/') || file?.path || file;
          const name = file?.name || (typeof file === 'string' ? file : 'File');
          const size = file?.size ? formatFileSize(file.size) : '';
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
          const { icon: Icon, color } = fileTypeIcon(file?.type);

          return (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="border rounded p-2 flex flex-col items-center justify-center hover:shadow hover:bg-gray-50 transition"
            >
              {isImage ? (
                <img src={url} alt={name} className="w-full h-32 object-cover rounded mb-1" />
              ) : (
                <div className={`flex flex-col items-center justify-center ${color}`}>
                  <Icon className="w-12 h-12 mb-1" />
                  <span className="text-xs font-medium truncate w-20 text-center">{name}</span>
                  <span className="text-xs text-gray-500 font-semibold">{size}</span>
                </div>
              )}
            </a>
          );
        })}
      </div>
    );
  };

  const renderStepData = (data: any) =>
    Object.entries(data).map(([key, value]) => {
      const isFileGroup =
        (Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === 'object' &&
          value[0] !== null &&
          'url' in value[0] &&
          'name' in value[0]) ||
        (value && typeof value === 'object' && 'url' in value && 'name' in value);

      const normalizeValue = String(value).toLowerCase();

      const renderSpecialValue = () => {
        if (
          normalizeValue === 'true' ||
          normalizeValue === 'approved' ||
          normalizeValue === 'approve'
        ) {
          return (
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <span className="capitalize">{String(value)}</span>
            </div>
          );
        }
        if (
          normalizeValue === 'false' ||
          normalizeValue === 'rejected' ||
          normalizeValue === 'deny'
        ) {
          return (
            <div className="flex items-center gap-2 text-red-600 font-semibold">
              <XCircle className="w-5 h-5" />
              <span className="capitalize">{String(value)}</span>
            </div>
          );
        }
        if (normalizeValue === 'pending' || normalizeValue === 'in-progress') {
          return (
            <div className="flex items-center gap-2 text-yellow-600 font-semibold">
              <Circle className="w-5 h-5" />
              <span className="capitalize">{String(value)}</span>
            </div>
          );
        }
        return <span className="text-gray-800 font-semibold">{String(value)}</span>;
      };

      return (
        <div key={key} className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2 capitalize">
            {key.replace(/_/g, ' ')}
          </h4>
          {isFileGroup ? (
            renderFilesGrid(value)
          ) : typeof value === 'object' ? (
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto font-medium">
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            renderSpecialValue()
          )}
        </div>
      );
    });

  if (loading) return <p>Loading workflow history...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <h2 className="text-2xl font-bold mb-6">Workflow History</h2>

      <div className="relative border-l-2 border-gray-300 pl-10 ml-4">
        {history.map((step, idx) => {
          const isExpanded = expandedSteps[step.id] || false;
          const markerColor = statusColor(step.status);

          return (
            <div key={idx} className="mb-8 relative">
              {/* Marker */}
              <span
                className={`absolute -left-[62px] top-0 w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-sm ${markerColor}`}
              >
                {idx + 1}
              </span>

              {/* Step header */}
              <div
                className="flex justify-between items-center cursor-pointer ml-4"
                onClick={() => toggleStep(step.id)}
              >
                <div>
                  <h3 className="text-lg font-semibold">{step.label || step.step_id}</h3>
                  <span className="text-sm text-gray-500">
                    {step.completed_at
                      ? format(new Date(step.completed_at), 'PPpp')
                      : format(new Date(step.created_at), 'PPpp')}
                  </span>
                  {step.actor && (
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <img
                        src={step.actor.avatar || toAbsoluteUrl('/media/avatars/blank.png')}
                        alt={step.actor.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-semibold">{step.actor.name}</span>
                    </p>
                  )}
                </div>
                <div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Step content */}
              {isExpanded && (
                <div className="ml-4 mt-3 p-4 border-l border-gray-200 space-y-4">
                  {step.data && renderStepData(step.data)}

                  {/* Comment section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Comment</h4>
                    {editingComment[step.id] ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={commentDrafts[step.id]}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [step.id]: e.target.value
                            }))
                          }
                          className="w-full border rounded p-2 text-sm"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveComment(step.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm rounded"
                          >
                            <Save className="w-4 h-4" /> Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit(step.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-sm rounded"
                          >
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <p className="text-gray-800 text-sm whitespace-pre-line">
                          {step.comment || 'No comment yet.'}
                        </p>
                        {canEdit(step) && (
                          <button
                            onClick={() => handleEditComment(step.id, step.comment)}
                            className="flex items-center gap-1 text-blue-600 text-sm"
                          >
                            <Edit3 className="w-4 h-4" /> Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
