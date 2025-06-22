import MarkdownViewer from '@/components/markdown/MarkdownViewer';
import { toAbsoluteUrl } from '@/utils';
import React from 'react';

interface IDropdownChatMessageInProps {
  text: string;
  time: string;
  onLinkClick?: (href: string) => void;
}

const DropdownChatMessageIn = ({ text, time, onLinkClick }: IDropdownChatMessageInProps) => {
  return (
    <div className="flex items-end gap-3.5 px-5 w-full">
      <img src={toAbsoluteUrl('/media/avatars/blank.png')} className="rounded-full size-9" alt="" />

      <div className="flex flex-col gap-1.5 max-w-xs sm:max-w-sm md:max-w-3xl">
        <div className="card shadow-none flex flex-col bg-gray-100 gap-2.5 p-3 rounded-bl-none text-2sm font-medium text-gray-700">
          {React.useMemo(
            () => (
              <MarkdownViewer content={text} onLinkClick={onLinkClick} />
            ),
            [text, onLinkClick]
          )}
        </div>
        <span className="text-2xs font-medium text-gray-500">{time}</span>
      </div>
    </div>
  );
};

export { DropdownChatMessageIn, type IDropdownChatMessageInProps };
