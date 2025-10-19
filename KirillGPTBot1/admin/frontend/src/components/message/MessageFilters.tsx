import React, { useState } from 'react';
import { MessageFilters as MessageFiltersType } from '@/types/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Filter, X, Calendar, Search } from 'lucide-react';

interface MessageFiltersProps {
  filters: MessageFiltersType;
  onFiltersChange: (filters: MessageFiltersType) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  chatId?: string;
}

const messageSourceOptions = [
  { value: '', label: 'All Messages' },
  { value: 'true', label: 'Bot Messages Only' },
  { value: 'false', label: 'User Messages Only' },
];

const perPageOptions = [
  { value: '20', label: '20 per page' },
  { value: '50', label: '50 per page' },
  { value: '100', label: '100 per page' },
];

export const MessageFiltersComponent: React.FC<MessageFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  chatId,
}) => {
  const [isExpanded, setIsExpanded] = useState(hasActiveFilters);

  const handleFilterChange = (key: keyof MessageFiltersType, value: string | number | boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handleDateChange = (key: 'start_date' | 'end_date', value: string) => {
    if (value) {
      const date = new Date(value + 'T00:00:00');
      handleFilterChange(key, date.toISOString());
    } else {
      handleFilterChange(key, undefined);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-900 hover:text-gray-700"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary-600 text-white rounded-full px-1.5 py-0.5 text-xs">
              {Object.values(filters).filter(v => v !== undefined && v !== '' && v !== 1).length}
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <Input
              label="Search Messages"
              placeholder="Search message content..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              icon={<Search />}
            />

            {/* Message Source */}
            <Select
              label="Message Source"
              value={filters.is_from_bot?.toString() || ''}
              onChange={(e) => handleFilterChange('is_from_bot', e.target.value === '' ? undefined : e.target.value === 'true')}
              options={messageSourceOptions}
            />

            {/* Date Range */}
            <Input
              label="Start Date"
              type="date"
              value={formatDateForInput(filters.start_date)}
              onChange={(e) => handleDateChange('start_date', e.target.value)}
              icon={<Calendar />}
            />

            <Input
              label="End Date"
              type="date"
              value={formatDateForInput(filters.end_date)}
              onChange={(e) => handleDateChange('end_date', e.target.value)}
              icon={<Calendar />}
            />

            {/* Per Page */}
            <Select
              label="Messages Per Page"
              value={filters.per_page?.toString() || '50'}
              onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
              options={perPageOptions}
            />
          </div>

          {/* Chat ID (if not in specific chat) */}
          {!chatId && (
            <Input
              label="Chat ID"
              placeholder="Filter by specific chat ID..."
              value={filters.chat_id || ''}
              onChange={(e) => handleFilterChange('chat_id', e.target.value)}
            />
          )}
        </div>
      )}
    </div>
  );
};