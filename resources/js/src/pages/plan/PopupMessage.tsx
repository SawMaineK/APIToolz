import { Users, Check, Pencil, Save } from 'lucide-react';
export const PopupMessage = ({
  title,
  message,
  onApprove,
  onCreate,
  onEdit
}: {
  title: string;
  message: string;
  onApprove?: () => void;
  onCreate?: () => void;
  onEdit?: () => void;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 8px 12px rgba(0,0,0,0.1)',
        animation: 'fadeIn 0.4s ease-in-out'
      }}
    >
      {/* Gradient Icon */}
      <div
        style={{
          background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
          color: 'white',
          padding: '8px',
          borderRadius: '8px'
        }}
      >
        <Users size={20} />
      </div>

      {/* Content */}
      <div style={{ flexGrow: 1 }}>
        <p style={{ fontWeight: 600, fontSize: '14px' }}>
          {title} <span style={{ fontWeight: 400 }}>{message}</span>
        </p>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginTop: '8px',
            fontSize: '14px'
          }}
        >
          {onApprove && (
            <button
              onClick={onApprove}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#111827',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Check size={16} /> Looks good
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#111827',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Pencil size={16} /> Edit
            </button>
          )}
          {onCreate && (
            <button
              onClick={onCreate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#111827',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Save size={16} /> Create tables
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
