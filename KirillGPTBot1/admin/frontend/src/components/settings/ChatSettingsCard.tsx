import React, { useState } from 'react';
import { Chat, ChatSettings, Preset } from '@/types/api';
import { useUpdateChatSettings, usePresets } from '@/hooks/useApi';
import { InlineEditor } from './InlineEditor';
import { Toggle } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  Settings, 
  Bot, 
  MessageSquare, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/utils/date';
import { cn } from '@/utils/cn';

interface ChatSettingsCardProps {
  chat: Chat;
  settings?: ChatSettings;
  className?: string;
}

export const ChatSettingsCard: React.FC<ChatSettingsCardProps> = ({
  chat,
  settings,
  className,
}) => {
  const { data: presets = [] } = usePresets();
  const { mutate: updateSettings, isPending } = useUpdateChatSettings();

  const [localSettings, setLocalSettings] = useState({
    auto_reply_enabled: settings?.auto_reply_enabled ?? true,
    reply_on_mention_enabled: settings?.reply_on_mention_enabled ?? true,
    preset_id: settings?.preset_id || '',
    temporary_preset_until: settings?.temporary_preset_until || '',
  });

  const presetOptions = [
    { value: '', label: 'No preset selected' },
    ...presets.map(preset => ({
      value: preset.id,
      label: preset.name + (preset.is_default ? ' (Default)' : ''),
    })),
  ];

  const handleSaveSettings = async () => {
    const updateData = {
      auto_reply_enabled: localSettings.auto_reply_enabled,
      reply_on_mention_enabled: localSettings.reply_on_mention_enabled,
      preset_id: localSettings.preset_id || undefined,
      temporary_preset_until: localSettings.temporary_preset_until || undefined,
    };

    return new Promise<void>((resolve, reject) => {
      updateSettings(
        { chatId: chat.id, settings: updateData },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });
  };

  const handleToggleChange = (field: string, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePresetChange = (presetId: string) => {
    setLocalSettings(prev => ({ ...prev, preset_id: presetId }));
  };

  const handleTemporaryPresetChange = (dateTime: string) => {
    setLocalSettings(prev => ({ ...prev, temporary_preset_until: dateTime }));
  };

  const selectedPreset = presets.find(p => p.id === localSettings.preset_id);
  const isTemporaryActive = localSettings.temporary_preset_until && 
    new Date(localSettings.temporary_preset_until) > new Date();

  return (
    <div className={cn('card', className)}>
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Chat Settings</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Configure bot behavior for this chat
        </p>
      </div>

      <div className="card-body space-y-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Response Behavior</h4>
          
          <InlineEditor
            onSave={handleSaveSettings}
            isLoading={isPending}
          >
            <Toggle
              label="Auto Reply"
              description="Bot responds automatically to all messages"
              checked={localSettings.auto_reply_enabled}
              onChange={(e) => handleToggleChange('auto_reply_enabled', e.target.checked)}
            />
          </InlineEditor>

          <InlineEditor
            onSave={handleSaveSettings}
            isLoading={isPending}
          >
            <Toggle
              label="Reply on Mention"
              description="Bot responds when mentioned (@username)"
              checked={localSettings.reply_on_mention_enabled}
              onChange={(e) => handleToggleChange('reply_on_mention_enabled', e.target.checked)}
            />
          </InlineEditor>
        </div>

        {/* Preset Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Personality Preset</h4>
          
          <InlineEditor
            onSave={handleSaveSettings}
            isLoading={isPending}
          >
            <Select
              label="Active Preset"
              value={localSettings.preset_id}
              onChange={(e) => handlePresetChange(e.target.value)}
              options={presetOptions}
            />
          </InlineEditor>

          {selectedPreset && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-gray-900">{selectedPreset.name}</h5>
                  {selectedPreset.description && (
                    <p className="text-sm text-gray-500 mt-1">{selectedPreset.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      Temperature: {selectedPreset.temperature}
                    </span>
                    {selectedPreset.tone && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                        {selectedPreset.tone}
                      </span>
                    )}
                    {selectedPreset.verbosity && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                        {selectedPreset.verbosity}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Temporary Preset */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Temporary Preset</h4>
          <p className="text-sm text-gray-500">
            Set a different preset temporarily until a specific date/time
          </p>
          
          <InlineEditor
            onSave={handleSaveSettings}
            isLoading={isPending}
          >
            <Input
              label="Until Date/Time"
              type="datetime-local"
              value={localSettings.temporary_preset_until ? 
                new Date(localSettings.temporary_preset_until).toISOString().slice(0, 16) : 
                ''
              }
              onChange={(e) => handleTemporaryPresetChange(
                e.target.value ? new Date(e.target.value).toISOString() : ''
              )}
              icon={<Clock />}
            />
          </InlineEditor>

          {isTemporaryActive && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="text-sm">
                <span className="font-medium text-yellow-800">Temporary preset active</span>
                <span className="text-yellow-600 ml-2">
                  Until {formatDateTime(localSettings.temporary_preset_until)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status Information */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Status</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                localSettings.auto_reply_enabled ? 'bg-green-400' : 'bg-gray-400'
              )} />
              <span className="text-gray-600">
                Auto Reply: {localSettings.auto_reply_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                localSettings.reply_on_mention_enabled ? 'bg-green-400' : 'bg-gray-400'
              )} />
              <span className="text-gray-600">
                On Mention: {localSettings.reply_on_mention_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {settings && (
            <div className="text-xs text-gray-500">
              Last updated: {formatRelativeTime(settings.updated_at)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};