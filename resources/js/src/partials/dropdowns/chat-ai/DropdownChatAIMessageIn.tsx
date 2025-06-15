import MarkdownViewer from '@/components/markdown/MarkdownViewer';
import { toAbsoluteUrl } from '@/utils';

interface IDropdownChatMessageInProps {
  text: string;
  time: string;
  onLinkClick?: (href: string) => void;
}

const DropdownChatAIMessageIn = ({ text, time, onLinkClick }: IDropdownChatMessageInProps) => {
  return (
    <div className="flex items-end gap-3.5 px-5 max-w-full">
      <img src={toAbsoluteUrl('/media/avatars/blank.png')} className="rounded-full size-9" alt="" />

      <div className="flex flex-col gap-1.5 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
        <div className="card shadow-none flex flex-col bg-gray-100 gap-2.5 p-3 rounded-bl-none text-2sm font-medium text-gray-700">
          <MarkdownViewer content={text} onLinkClick={onLinkClick} />
        </div>
        <span className="text-2xs font-medium text-gray-500">{time}</span>
      </div>
    </div>
  );
};

export { DropdownChatAIMessageIn, type IDropdownChatMessageInProps };
