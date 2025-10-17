import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  className,
  onClear,
  showClearButton = true,
  ...props
}) => {
  const hasValue = props.value && String(props.value).length > 0;

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className={cn(
          'block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm',
          className
        )}
        {...props}
      />
      {showClearButton && hasValue && onClear && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={onClear}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};