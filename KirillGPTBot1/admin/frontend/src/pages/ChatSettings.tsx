import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useChat, useChatSettings } from '@/hooks/useApi';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ChatSettingsCard } from '@/components/settings/ChatSettingsCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  RefreshCw, 
  MessageSquare,
  Settings as SettingsIcon,
  Hash
} from 'lucide-react';
import { formatDateTime } from '@/utils/date';

export const ChatSettings: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { subscribe } = useWebSocket();

  // API calls
  const { 
    data: chatData, 
    isLoading: chatLoading, 
    refetch: refetchChat,
    error: chatError 
  } = useChat(chatId || '');

  const { 
    data: settingsData, 
    isLoading: settingsLoading, 
    refetch: refetchSettings,
    error: settingsError 
  } = useChatSettings(chatId || '');

  // Real-time updates
  useEffect(() => {
    const handleSettingsChanged = (data: any) => {
      if (data.chat_id === chatId) {
        refetchSettings();
        refetchChat();
      }
    };

    subscribe('chat_settings_changed', handleSettingsChanged);

    return () => {
      // Cleanup handled by useWebSocket hook
    };
  }, [subscribe, refetchSettings, refetchChat, chatId]);

  const handleRefresh = () => {
    refetchChat();
    refetchSettings();
  };

  const getChatDisplayName = (chat: typeof chatData) => {
    if (!chat) return 'Loading...';
    if (chat.title) return chat.title;
    if (chat.username) return `@${chat.username}`;
    return `Chat ${chat.telegram_chat_id}`;
  };

  if (!chatId) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No chat selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a chat to view its settings
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/chats')}>
              View All Chats
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (chatError || settingsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/chats')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chats
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Chat Settings</h1>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="text-red-600">
              Error loading {chatError ? 'chat' : 'settings'} data. Please try again.
            </p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = chatLoading || settingsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/chats')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Settings: {getChatDisplayName(chatData)}
            </h1>
            {chatData && (
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-1" />
                  <span>{chatData.telegram_chat_id}</span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    chatData.chat_type === 'private' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {chatData.chat_type}
                  </span>
                </div>
                <span>Created: {formatDateTime(chatData.created_at)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/chats/${chatId}`}
            className="btn btn-secondary flex items-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            View Messages
          </Link>
          
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : chatData ? (
          <div className="space-y-6">
            <ChatSettingsCard
              chat={chatData}
              settings={settingsData}
            />

            {/* Additional Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Chat Information</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Basic Info</h4>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-600">Telegram ID:</dt>
                        <dd className="font-mono text-gray-900">{chatData.telegram_chat_id}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Chat Type:</dt>
                        <dd className="text-gray-900 capitalize">{chatData.chat_type}</dd>
                      </div>
                      {chatData.username && (
                        <div>
                          <dt className="text-gray-600">Username:</dt>
                          <dd className="text-gray-900">@{chatData.username}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Timestamps</h4>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-600">Created:</dt>
                        <dd className="text-gray-900">{formatDateTime(chatData.created_at)}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Last Updated:</dt>
                        <dd className="text-gray-900">{formatDateTime(chatData.updated_at)}</dd>
                      </div>
                      {settingsData && (
                        <div>
                          <dt className="text-gray-600">Settings Updated:</dt>
                          <dd className="text-gray-900">{formatDateTime(settingsData.updated_at)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chat not found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The requested chat could not be found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};