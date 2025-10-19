import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Check, X, Edit2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface InlineEditorProps {
  children: React.ReactElement;
  onSave: () => Promise<void> | void;
  onCancel?: () => void;
  canEdit?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
  children,
  onSave,
  onCancel,
  canEdit = true,
  isLoading = false,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      await onSave();
      setIsEditing(false);
    } catch (error) {
      // Keep editing mode if save fails
      console.error('Save failed:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Clone children to add editing props
  const enhancedChildren = React.cloneElement(children, {
    disabled: !isEditing || isLoading,
    onKeyDown: isEditing ? handleKeyDown : undefined,
  });

  return (
    <div className={cn('group relative', className)}>
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          {enhancedChildren}
        </div>

        {canEdit && (
          <div className={cn(
            'flex items-center space-x-1',
            isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'
          )}>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="p-1 text-green-600 hover:text-green-700 rounded transition-colors disabled:opacity-50"
                  title="Save (⌘+Enter)"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors disabled:opacity-50"
                  title="Cancel (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      {isEditing && (
        <div className="text-xs text-gray-500 mt-1">
          Press ⌘+Enter to save, Esc to cancel
        </div>
      )}
    </div>
  );
};