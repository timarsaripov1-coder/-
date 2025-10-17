import React from 'react';
import { Link } from 'react-router-dom';
import { Chat, ChatSettings } from '@/types/api';
import { formatRelativeTime, formatDateTime } from '@/utils/date';
import { 
  MessageSquare, 
  Users, 
  User, 
  Bot, 
  Settings,
  Clock,
  Hash
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ChatCardProps {
  chat: Chat;
  settings?: ChatSettings;
  messageCount?: number;
  lastMessageTime?: string;
  onClick?: () => void;
  className?: string;
}

export const ChatCard: React.FC<ChatCardProps> = ({
  chat,
  settings,
  messageCount = 0,
  lastMessageTime,
  onClick,
  className,
}) => {
  const getChatTypeIcon = (type: string) => {
    switch (type) {
      case 'private':
        return User;
      case 'group':
      case 'supergroup':
        return Users;
      default:
        return MessageSquare;
    }
  };

  const ChatTypeIcon = getChatTypeIcon(chat.chat_type);

  const getChatDisplayName = () => {
    if (chat.title) return chat.title;
    if (chat.username) return `@${chat.username}`;
    return `Chat ${chat.telegram_chat_id}`;
  };

  return (
    <div
      className={cn(
        'card hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Chat Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <ChatTypeIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {getChatDisplayName()}
                </h3>
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  chat.chat_type === 'private' 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                )}>
                  {chat.chat_type}
                </span>
              </div>

              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-1" />
                  <span>{chat.telegram_chat_id}</span>
                </div>
                {chat.username && (
                  <div className="flex items-center">
                    <span>@{chat.username}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{messageCount} messages</span>
                </div>
                {lastMessageTime && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Last: {formatRelativeTime(lastMessageTime)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Indicator */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            {settings && (
              <div className="flex items-center space-x-1">
                {settings.auto_reply_enabled && (
                  <div className="w-2 h-2 bg-green-400 rounded-full" title="Auto-reply enabled" />
                )}
                {settings.preset && (
                  <Bot className="h-4 w-4 text-primary-600" title={`Preset: ${settings.preset.name}`} />
                )}
              </div>
            )}
            <Link
              to={`/chats/${chat.id}/settings`}
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Settings className="h-4 w-4" aria-label="Chat settings" />
            </Link>
          </div>
        </div>

        {/* Footer with timestamps */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Created: {formatDateTime(chat.created_at)}</span>
          <span>Updated: {formatRelativeTime(chat.updated_at)}</span>
        </div>
      </div>
    </div>
  );
};