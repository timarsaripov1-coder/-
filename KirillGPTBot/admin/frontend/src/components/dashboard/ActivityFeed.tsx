import React from 'react';
import { formatRelativeTime } from '@/utils/date';
import { Message } from '@/types/api';
import { MessageSquare, Bot, User, Clock } from 'lucide-react';

interface ActivityFeedProps {
  messages: Message[];
  loading?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ messages, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-6">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {messages.map((message, messageIdx) => (
          <li key={message.id}>
            <div className="relative pb-8">
              {messageIdx !== messages.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      message.is_from_bot
                        ? 'bg-primary-500'
                        : 'bg-gray-400'
                    }`}
                  >
                    {message.is_from_bot ? (
                      <Bot className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {message.is_from_bot ? 'Kirill GPT' : 'User'}
                      </span>
                      {message.chat && (
                        <span className="text-sm text-gray-500">
                          in {message.chat.title || `Chat ${message.chat.telegram_chat_id}`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {message.content || 'No content'}
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <time dateTime={message.created_at}>
                        {formatRelativeTime(message.created_at)}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};