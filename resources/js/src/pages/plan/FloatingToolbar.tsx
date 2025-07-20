import { Network, PanelLeftClose } from 'lucide-react';

export const FloatingToolbar = ({ onTogglePanel }: { onTogglePanel: () => void }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'white',
        borderRadius: '12px',
        padding: '8px 12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 20
      }}
    >
      <button title="Layout Options" className="hover:bg-gray-100 p-2 rounded-md">
        <Network size={20} strokeWidth={2} />
      </button>
      <div className="w-px h-6 bg-gray-300" />
      <button
        title="Expand Info"
        onClick={onTogglePanel}
        className="hover:bg-gray-100 p-2 rounded-md"
      >
        <PanelLeftClose size={20} strokeWidth={2} />
      </button>
    </div>
  );
};
