import React, { useRef, useState } from 'react';
import {
  FilePlus2,
  Paperclip,
  Send,
  CalendarCheck,
  Clock3,
  FolderSearch,
  ChevronRight,
  ChevronLeft,
  SendHorizonal
} from 'lucide-react';
import { MiscHelp } from '@/partials/misc';
import { Checkbox } from '@/components/ui/checkbox';

interface IPlanMarkerProps {
  handleSubmit: (text: string) => void;
}
export const PlanMaker = ({ handleSubmit }: IPlanMarkerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [textareaValue, setTextareaValue] = useState('');

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };
  const suggestions = [
    {
      icon: <CalendarCheck size={18} />,
      text: 'I need my staff to check out equipment and be notified of due dates'
    },
    {
      icon: <Clock3 size={18} />,
      text: 'Employees need to log vacation hours'
    },
    {
      icon: <FolderSearch size={18} />,
      text: 'My team needs a solution for project documentation'
    }
  ];

  const handleSuggestionClick = (text: string) => {
    setTextareaValue(text);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-8 relative overflow-hidden">
      {/* Decorative floating sparkles */}
      <div className="absolute top-10 right-20 text-pink-300 text-4xl animate-pulse">✦</div>
      <div className="absolute top-20 left-32 text-purple-200 text-3xl animate-bounce">✧</div>
      <div className="absolute bottom-20 right-40 text-pink-200 text-5xl animate-pulse">✦</div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800">Let's make a plan</h1>
      <p className="text-gray-500 text-sm mt-1">
        This feature uses generative AI.{' '}
        <a href="#" className="text-blue-500 hover:underline">
          See terms
        </a>
      </p>

      {/* Suggestions scrollable */}
      <div className="relative w-full max-w-5xl mt-6 flex items-center">
        {/* Left Scroll Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-1 bg-white shadow rounded-full p-2 hover:bg-gray-100"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Scrollable Chips */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-12 w-full no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {suggestions.map((s, idx) => (
            <div
              key={idx}
              onClick={() => handleSuggestionClick(s.text)}
              className="flex items-center gap-2 whitespace-nowrap bg-white px-4 py-2 rounded-full shadow-sm border hover:shadow transition cursor-pointer"
            >
              {s.icon}
              <span className="text-sm">{s.text}</span>
            </div>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={scrollRight}
          className="absolute right-0 z-1 bg-white shadow rounded-full p-2 hover:bg-gray-100"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Input Area */}
      <div className="my-6 w-full bg-white rounded-xl shadow-md border relative">
        <textarea
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.target.value)}
          placeholder="Describe a problem that your users have today."
          className="w-full h-40 p-4 text-gray-700 outline-none resize-none rounded-xl"
        />

        {/* Bottom Toolbar */}
        <div className="flex justify-between items-center p-4 border-t text-sm text-gray-500">
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
            <FilePlus2 size={16} />
            Add files
          </button>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox />
              Include preview features
            </label>

            <button
              disabled={!textareaValue.trim()}
              onClick={() => {
                handleSubmit(textareaValue);
                setTextareaValue('');
              }}
              className={`p-2 rounded-full shadow transition ${
                textareaValue.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      </div>
      <MiscHelp />
    </div>
  );
}
