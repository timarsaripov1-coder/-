import React from 'react';
import { Preset } from '@/types/api';
import { formatRelativeTime } from '@/utils/date';
import { 
  Bot, 
  Edit, 
  Trash2, 
  Star, 
  Thermometer,
  MessageSquare,
  Sliders
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

interface PresetCardProps {
  preset: Preset;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault?: () => void;
  className?: string;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  onEdit,
  onDelete,
  onSetDefault,
  className,
}) => {
  const getToneColor = (tone?: string) => {
    const toneColors: Record<string, string> = {
      friendly: 'text-green-600 bg-green-50',
      professional: 'text-blue-600 bg-blue-50',
      casual: 'text-purple-600 bg-purple-50',
      formal: 'text-gray-600 bg-gray-50',
      humorous: 'text-yellow-600 bg-yellow-50',
      serious: 'text-red-600 bg-red-50',
    };
    return toneColors[tone?.toLowerCase() || ''] || 'text-gray-600 bg-gray-50';
  };

  const getVerbosityColor = (verbosity?: string) => {
    const verbosityColors: Record<string, string> = {
      concise: 'text-blue-600 bg-blue-50',
      normal: 'text-green-600 bg-green-50',
      detailed: 'text-orange-600 bg-orange-50',
      verbose: 'text-red-600 bg-red-50',
    };
    return verbosityColors[verbosity?.toLowerCase() || ''] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className={cn(
      'card hover:shadow-md transition-shadow',
      preset.is_default && 'ring-2 ring-primary-500',
      className
    )}>
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={cn(
              'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
              preset.is_default 
                ? 'bg-primary-100 text-primary-600' 
                : 'bg-gray-100 text-gray-600'
            )}>
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {preset.name}
                </h3>
                {preset.is_default && (
                  <Star className="h-4 w-4 text-primary-500 fill-current" />
                )}
              </div>
              {preset.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {preset.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-gray-500 hover:text-gray-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {!preset.is_default && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-gray-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Properties */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Temperature: {preset.temperature || 0.7}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Max tokens: {preset.max_tokens || 600}
            </span>
          </div>

          {preset.tone && (
            <div className="flex items-center space-x-2">
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                getToneColor(preset.tone)
              )}>
                {preset.tone}
              </span>
            </div>
          )}

          {preset.verbosity && (
            <div className="flex items-center space-x-2">
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                getVerbosityColor(preset.verbosity)
              )}>
                {preset.verbosity}
              </span>
            </div>
          )}
        </div>

        {/* Emotional Intensity */}
        {preset.emotional_intensity !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Emotional Intensity</span>
              <span className="text-gray-900 font-medium">{preset.emotional_intensity}%</span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${preset.emotional_intensity || 50}%` }}
              />
            </div>
          </div>
        )}

        {/* System Prompt Override */}
        {preset.system_prompt_override && (
          <div className="mt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Sliders className="h-4 w-4" />
              <span>Custom System Prompt</span>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-sm text-gray-700 line-clamp-3">
                {preset.system_prompt_override}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Updated: {formatRelativeTime(preset.updated_at)}</span>
          {!preset.is_default && onSetDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSetDefault}
              className="text-xs text-gray-500 hover:text-primary-600"
            >
              Make Default
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};