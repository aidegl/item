import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface TooltipProps {
  content: string;
}

export function Tooltip({ content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-blue-500 hover:text-blue-600 transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {isVisible && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-blue-600 text-white text-xs rounded-lg p-3 shadow-lg z-50">
          <div className="relative">
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
          </div>
        </div>
      )}
    </div>
  );
}
