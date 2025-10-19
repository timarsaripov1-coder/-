import React from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Filter, X } from 'lucide-react';

export interface ChatFilters {
  chatType: string;
  hasSettings: string;
  sortBy: string;
}

interface ChatFiltersProps {
  filters: ChatFilters;
  onFiltersChange: (filters: ChatFilters) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const chatTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'private', label: 'Private Chats' },
  { value: 'group', label: 'Groups' },
  { value: 'supergroup', label: 'Supergroups' },
  { value: 'channel', label: 'Channels' },
];

const hasSettingsOptions = [
  { value: 'all', label: 'All Chats' },
  { value: 'with_settings', label: 'With Settings' },
  { value: 'without_settings', label: 'Without Settings' },
];

const sortByOptions = [
  { value: 'updated_desc', label: 'Recently Updated' },
  { value: 'created_desc', label: 'Recently Created' },
  { value: 'created_asc', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
];

export const ChatFiltersComponent: React.FC<ChatFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const handleFilterChange = (key: keyof ChatFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Chat Type"
          value={filters.chatType}
          onChange={(e) => handleFilterChange('chatType', e.target.value)}
          options={chatTypeOptions}
        />

        <Select
          label="Settings Status"
          value={filters.hasSettings}
          onChange={(e) => handleFilterChange('hasSettings', e.target.value)}
          options={hasSettingsOptions}
        />

        <Select
          label="Sort By"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          options={sortByOptions}
        />
      </div>
    </div>
  );
};