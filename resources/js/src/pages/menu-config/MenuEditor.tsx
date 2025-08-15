import React, { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { useSettings } from '@/providers';
import { toast } from 'sonner';
import { TMenuConfig } from '@/components';
import axios from 'axios';
import { Minus, Plus, Save } from 'lucide-react';
import IconPicker from '@/components/icon/IconPicker';

/**
 * Nested Menu Editor with cross-parent drag & drop
 * -------------------------------------------------
 * - Edit/add/delete menu items at any level
 * - Drag between parents and reorder
 * - Exports JSON
 *
 * Notes:
 * - Roles editor is a simple comma-separated input to avoid extra deps
 * - Tailwind classes are used for quick styling
 */

// ---------------- Types ----------------
export type MenuItem = {
  id: string;
  icon?: string;
  path?: string;
  roles?: string[];
  title?: string;
  heading?: string; // when heading exists, title/path/icon typically omitted
  children?: MenuItem[];
};

// -------------- Helpers (tree ops) --------------
function clone<T>(obj: T): T {
  // eslint-disable-next-line no-undef
  return structuredClone(obj);
}

function findParentAndIndexById(
  tree: MenuItem[],
  id: string
): { parent: MenuItem[] | null; index: number } | null {
  const stack: { parent: MenuItem[] | null; list: MenuItem[] }[] = [{ parent: null, list: tree }];
  while (stack.length) {
    const { parent, list } = stack.pop()!;
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) return { parent: list, index: idx };
    for (const node of list) {
      if (node.children && node.children.length) {
        stack.push({ parent: node.children, list: node.children });
      }
    }
  }
  return null;
}

function removeById(tree: MenuItem[], id: string): { item: MenuItem | null; next: MenuItem[] } {
  const t = clone(tree);
  const loc = findParentAndIndexById(t, id);
  if (!loc || !loc.parent) {
    // try root
    const rootIdx = t.findIndex((n) => n.id === id);
    if (rootIdx !== -1) {
      const [item] = t.splice(rootIdx, 1);
      return { item, next: t };
    }
    return { item: null, next: t };
  }
  const [item] = loc.parent.splice(loc.index, 1);
  return { item, next: t };
}

function insertInto(
  tree: MenuItem[],
  parentId: string | null,
  index: number,
  item: MenuItem
): MenuItem[] {
  const t = clone(tree);
  if (parentId === null) {
    t.splice(index, 0, item);
    return t;
  }
  const parentLoc = findParentAndIndexById(t, parentId);
  if (!parentLoc) return t;
  const parentNode = (parentLoc.parent ?? t)[parentLoc.index];
  parentNode.children = parentNode.children || [];
  parentNode.children.splice(index, 0, item);
  return t;
}

function getChildrenIds(list: MenuItem[] | undefined): string[] {
  return (list ?? []).map((c) => c.id);
}

// -------------- UI: Sortable row --------------
const Row: React.FC<{
  item: MenuItem;
  depth: number;
  onAddChild: (parentId: string) => void;
  onAddBelow: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (id: string, patch: Partial<MenuItem>) => void;
}> = ({ item, depth, onAddChild, onAddBelow, onDelete, onChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="rounded border p-3 bg-white shadow-sm mb-2"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 cursor-grab select-none" {...listeners}>
          ⋮⋮
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            className="border rounded px-2 py-1"
            placeholder="Heading (optional)"
            value={item.heading ?? ''}
            onChange={(e) => onChange(item.id, { heading: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Title"
            value={item.title ?? ''}
            onChange={(e) => onChange(item.id, { title: e.target.value })}
          />
          <IconPicker
            value={item.icon}
            onChange={(iconName) => onChange(item.id, { icon: iconName })}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Path"
            value={item.path ?? ''}
            onChange={(e) => onChange(item.id, { path: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1 md:col-span-2"
            placeholder="Roles (comma separated)"
            value={(item.roles ?? []).join(', ')}
            onChange={(e) =>
              onChange(item.id, {
                roles: e.target.value
                  .split(',')
                  .map((r) => r.trim())
                  .filter(Boolean)
              })
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-500">
          ID: {item.id.slice(0, 8)} • Depth {depth}
        </div>
        <div className="flex gap-2">
          <button onClick={() => onAddChild(item.id)} className="btn btn-sm btn-success">
            <Plus size={16} /> Child
          </button>
          <button onClick={() => onAddBelow(item.id)} className="btn btn-sm btn-info">
            <Plus size={16} /> Below
          </button>
          <button onClick={() => onDelete(item.id)} className="btn btn-sm btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------- UI: Droppable list (container) --------------
const DroppableList: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={'min-h-4 ' + (isOver ? 'bg-amber-50' : '')}>
      {children}
    </div>
  );
};

// -------------- Main Editor --------------
const MenuEditor: React.FC<{ defaultData?: MenuItem[] }> = ({ defaultData }) => {
  const { settings, updateSettings } = useSettings();
  const [tree, setTree] = useState<MenuItem[]>(() => defaultData ?? []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleAddRoot = () => {
    setTree((t) => [...t, { id: crypto.randomUUID(), title: 'New Item' }]);
  };

  const handleAddBelow = (id: string) => {
    const newItem: MenuItem = { id: crypto.randomUUID(), title: 'New Item' };
    setTree((t) => {
      const nt = clone(t);
      const loc = findParentAndIndexById(nt, id);
      if (!loc) return nt;
      const list = loc.parent ?? nt;
      list.splice(loc.index + 1, 0, newItem); // insert right after current
      return nt;
    });
  };

  const handleAddChild = (parentId: string) => {
    const child: MenuItem = { id: crypto.randomUUID(), title: 'New Child', children: [] };
    setTree((t) => {
      const nt = clone(t);
      const loc = findParentAndIndexById(nt, parentId);
      if (!loc) return nt;
      const parentNode = (loc.parent ?? nt)[loc.index];
      parentNode.children = parentNode.children || [];
      parentNode.children.push(child);
      return nt;
    });
  };

  const handleDelete = (id: string) => {
    setTree((t) => removeById(t, id).next);
  };

  const handlePatch = (id: string, patch: Partial<MenuItem>) => {
    setTree((t) => {
      const nt = clone(t);
      const loc = findParentAndIndexById(nt, id);
      if (!loc) return nt;
      const list = loc.parent ?? nt;
      list[loc.index] = { ...list[loc.index], ...patch };
      return nt;
    });
  };

  // ------- DnD helpers -------
  const containerIdFor = (parentId: string | null) =>
    parentId ? `container-${parentId}` : 'container-root';

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const handleDragOver = (_e: DragOverEvent) => {
    // We visually highlight droppable containers with DroppableList; actual moving is done on end.
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    // Remove active item
    const { item, next } = removeById(tree, activeId);
    if (!item) return;

    // Determine drop target parent + index
    if (overId.startsWith('container-')) {
      const parentId = overId.replace('container-', '');
      const targetParentId = parentId === 'root' ? null : parentId;
      // insert at end of that container
      const index =
        targetParentId === null
          ? next.length
          : ((findParentAndIndexById(next, targetParentId)!.parent ?? next)[
              findParentAndIndexById(next, targetParentId)!.index
            ].children?.length ?? 0);
      const inserted = insertInto(next, targetParentId, index, item);
      setTree(inserted);
      return;
    }

    // Dropped over another item -> insert before that item inside its parent
    const targetLoc = findParentAndIndexById(next, overId);
    if (!targetLoc) {
      setTree(next);
      return;
    }
    const targetList = targetLoc.parent ?? next; // parent array
    const targetParentId: string | null = (() => {
      if (!targetLoc.parent) return null; // root
      // Find the actual parent node id by searching the tree for an item whose children is this array
      // We can do it by finding the node that contains overId then returning its parent id.
      // Since we already have targetLoc, compute parent id by scanning next.
      const stack: (MenuItem | null | undefined)[] = next;
      const findParentId = (
        nodes: MenuItem[],
        id: string,
        parentId: string | null
      ): string | null => {
        for (const n of nodes) {
          if (n.id === id) return parentId; // the item itself, return its parent id
          if (n.children) {
            const found = findParentId(n.children, id, n.id);
            if (found !== null) return found;
          }
        }
        return null;
      };
      return findParentId(next, overId, null);
    })();

    const index = targetLoc.index; // insert before the target item
    const inserted = insertInto(next, targetParentId, index, item);
    setTree(inserted);
  };
  // Render recursively with per-parent SortableContext and Droppable container ids
  const renderList = (list: MenuItem[], parentId: string | null, depth: number) => {
    const containerId = containerIdFor(parentId ?? null);
    return (
      <DroppableList id={containerId}>
        <SortableContext items={getChildrenIds(list)} strategy={verticalListSortingStrategy}>
          {list.map((node) => (
            <div key={node.id}>
              <div className="flex items-center">
                <div className="flex-1">
                  <Row
                    item={node}
                    depth={depth}
                    onAddChild={handleAddChild}
                    onAddBelow={handleAddBelow}
                    onDelete={handleDelete}
                    onChange={handlePatch}
                  />
                </div>
                {node.children && node.children.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-xs bg-gray-200 ml-2"
                    onClick={() =>
                      setCollapsed((prev) => ({
                        ...prev,
                        [node.id]: !prev[node.id]
                      }))
                    }
                  >
                    {collapsed[node.id] ? <Plus size={10} /> : <Minus size={10} />}
                  </button>
                )}
              </div>
              {node.children && node.children.length > 0 && !collapsed[node.id] && (
                <div className="ml-4 border-l p-4 mr-9 bg-gray-50">
                  {renderList(node.children, node.id, depth + 1)}
                </div>
              )}
              {/* Empty children drop zone */}
              {!node.children || node.children.length === 0 || collapsed[node.id] ? (
                <DroppableList id={containerIdFor(node.id)}>
                  <div className="h-2" />
                </DroppableList>
              ) : null}
            </div>
          ))}
        </SortableContext>
      </DroppableList>
    );
  };

  const exportJson = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_APP_API_URL}/appsetting/${settings.configId}`, {
        key: settings.configKey,
        menu_config: tree
      });
      updateSettings({ menuConfig: tree as TMenuConfig });
      toast.success('Changes have been successfully applied.');
    } catch (error: any) {
      console.error('Form submission failed:', error);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-3">Menu Settings</h1>
          <p className="text-sm text-gray-600 mb-4">
            Drag items to reorder or move into other parents. Click "+ Child" to add children. Edit
            fields inline.
          </p>
        </div>
        <div className="    ">
          <button onClick={handleAddRoot} className="btn btn-success mr-2">
            <Plus size={16} /> Add Menu
          </button>
          <button onClick={exportJson} className="btn btn-primary">
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {renderList(tree, null, 0)}
      </DndContext>
    </div>
  );
};

export default MenuEditor;
