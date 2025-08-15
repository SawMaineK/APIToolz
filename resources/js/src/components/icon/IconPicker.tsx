import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    return Object.keys(Icons)
      .filter((key) => {
        if (typeof key !== 'string') return false;

        // Exclude keys that include 'Icon' or 'Lucide'
        if (key.toLowerCase().includes('icon') || key.toLowerCase().includes('lucide')) return false;

        // If search is empty, include all valid icons
        if (search.length === 0) return true;

        // Otherwise, include only if name matches search
        return key.toLowerCase().includes(search.toLowerCase());
      })
      .sort();
  }, [search]);

  const IconComponent = value ? (Icons[value as keyof typeof Icons] as LucideIcon) : null;

  return (
    <div className="relative">
      {/* Selected icon display */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 border rounded px-2 py-1 cursor-pointer bg-white hover:bg-gray-50"
      >
        {IconComponent ? (
          <IconComponent size={18} />
        ) : (
          <span className="text-gray-400">No icon</span>
        )}
        <span className="text-sm">{value || 'Select icon'}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-150 max-h-80 overflow-y-auto bg-white border rounded shadow-lg p-2">
          {/* Search box */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="w-full mb-4 px-2 py-1 border rounded"
          />

          {/* Icon grid */}
          <div className="grid grid-cols-12 gap-2">
            {filteredIcons.slice(0, 84).map((iconName) => {
              const Ico = Icons[iconName as keyof typeof Icons] as LucideIcon;
              if (!Ico) return null; // Skip if icon component is not found
              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  className="flex flex-col items-center p-1 hover:bg-gray-100 rounded"
                >
                  <Ico size={20} />
                  {/* <span className="text-[10px] truncate">{iconName}</span> */}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;
