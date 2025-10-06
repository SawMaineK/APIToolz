import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      {/* Drag handle icon */}
      <button
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        className="cursor-grab text-gray-400 hover:text-gray-600 mt-1"
      >
        <GripVertical size={16} />
      </button>

      {/* Actual field content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};
