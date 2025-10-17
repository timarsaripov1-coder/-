import React from 'react';
import { Message } from '@/types/api';
import { formatMessageTime, formatDateTime } from '@/utils/date';
import { Bot, User, Reply, Hash, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MessageBubbleProps {
  message: Message;
  showDetails?: boolean;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showDetails = false,
  className,
}) => {
  const isFromBot = message.is_from_bot;

  return (
    <div className={cn('flex space-x-3', className)}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
          isFromBot ? 'bg-primary-600' : 'bg-gray-500'
        )}>
          {isFromBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center space-x-2 text-sm">
          <span className={cn(
            'font-medium',
            isFromBot ? 'text-primary-700' : 'text-gray-700'
          )}>
            {isFromBot ? 'Kirill GPT' : message.user?.first_name || 'User'}
          </span>
          <span className="text-gray-500">•</span>
          <time 
            dateTime={message.created_at}
            className="text-gray-500"
            title={formatDateTime(message.created_at)}
          >
            {formatMessageTime(message.created_at)}
          </time>
          {message.is_reply && (
            <>
              <span className="text-gray-500">•</span>
              <Reply className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500 text-xs">Reply</span>
            </>
          )}
        </div>

        {/* Message Body */}
        <div className={cn(
          'mt-1 p-3 rounded-lg max-w-xl',
          isFromBot 
            ? 'bg-primary-50 border border-primary-100' 
            : 'bg-gray-50 border border-gray-200'
        )}>
          {message.content ? (
            <p className="text-gray-900 whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : (
            <p className="text-gray-500 italic">No content</p>
          )}
        </div>

        {/* Details */}
        {showDetails && (
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Hash className="h-3 w-3 mr-1" />
                <span>ID: {message.telegram_message_id}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDateTime(message.created_at)}</span>
              </div>
            </div>
            {message.message_hash && (
              <div>
                <span>Hash: {message.message_hash}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};