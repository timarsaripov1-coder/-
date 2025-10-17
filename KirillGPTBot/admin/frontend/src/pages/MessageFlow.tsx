import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages, useChat } from '@/hooks/useApi';
import { useWebSocket } from '@/hooks/useWebSocket';
import { MessageFilters } from '@/types/api';
import { MessageBubble } from '@/components/message/MessageBubble';
import { MessageFiltersComponent } from '@/components/message/MessageFilters';
import { MessageComposer } from '@/components/message/MessageComposer';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { 
  MessageSquare, 
  ArrowLeft,
  RefreshCw,
  Settings,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatDateTime } from '@/utils/date';

const defaultFilters: MessageFilters = {
  page: 1,
  per_page: 50,
};

export const MessageFlow: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { subscribe } = useWebSocket();

  // State
  const [filters, setFilters] = useState<MessageFilters>({
    ...defaultFilters,
    chat_id: chatId,
  });
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // API calls
  const { 
    data: messagesData, 
    isLoading: messagesLoading, 
    refetch: refetchMessages,
    error: messagesError
  } = useMessages(filters);

  const { 
    data: chatData, 
    isLoading: chatLoading,
    error: chatError
  } = useChat(chatId || '');

  // Real-time updates
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      if (!chatId || data.message?.chat_id === chatId) {
        refetchMessages();
      }
    };

    const handleAdminMessageSent = (data: any) => {
      if (!chatId || data.chat_id === chatId) {
        refetchMessages();
      }
    };

    subscribe('new_message', handleNewMessage);
    subscribe('admin_message_sent', handleAdminMessageSent);

    return () => {
      // Cleanup handled by useWebSocket hook
    };
  }, [subscribe, refetchMessages, chatId]);

  // Calculate pagination
  const pagination = useMemo(() => {
    if (!messagesData) {
      return {
        currentPage: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
    }

    const totalPages = Math.ceil(messagesData.total / (filters.per_page || 50));
    const currentPage = filters.page || 1;

    return {
      currentPage,
      totalPages,
      hasNext: messagesData.has_next,
      hasPrev: currentPage > 1,
    };
  }, [messagesData, filters.page, filters.per_page]);

  const hasActiveFilters = useMemo(() => {
    const defaultKeys = Object.keys(defaultFilters);
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'chat_id') return false; // Don't count chat_id as active filter
      if (defaultKeys.includes(key)) {
        return value !== defaultFilters[key as keyof typeof defaultFilters];
      }
      return value !== undefined && value !== '' && value !== null;
    });
  }, [filters]);

  const handleFiltersChange = (newFilters: MessageFilters) => {
    setFilters({
      ...newFilters,
      chat_id: chatId, // Ensure chat_id is preserved
      page: 1, // Reset to first page when filters change
    });
  };

  const handleClearFilters = () => {
    setFilters({
      ...defaultFilters,
      chat_id: chatId,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    refetchMessages();
  };

  const handleMessageSent = () => {
    refetchMessages();
  };

  if (messagesError || chatError) {
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
          <h1 className="text-2xl font-bold text-gray-900">Message History</h1>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="text-red-600">Error loading messages. Please try again.</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              {chatData ? (
                chatData.title || `Chat ${chatData.telegram_chat_id}`
              ) : (
                chatId ? 'Chat Messages' : 'All Messages'
              )}
            </h1>
            {messagesData && (
              <p className="text-sm text-gray-500">
                {messagesData.total} messages total
                {chatData && (
                  <> • Created {formatDateTime(chatData.created_at)}</>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'ring-2 ring-primary-500' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-primary-600 text-white rounded-full px-1.5 py-0.5 text-xs">
                {Object.values(filters).filter((v, i) => v !== Object.values(defaultFilters)[i] && v !== chatId).length}
              </span>
            )}
          </Button>

          {chatData && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/chats/${chatData.id}/settings`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={messagesLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${messagesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <MessageFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          chatId={chatId}
        />
      )}

      {/* Message Composer (only for specific chat) */}
      {chatId && (
        <MessageComposer
          chatId={chatId}
          onSent={handleMessageSent}
        />
      )}

      {/* Messages */}
      <div className="space-y-6">
        {messagesLoading && !messagesData ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : messagesData?.messages?.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more messages'
                : chatId 
                  ? 'No messages in this chat yet'
                  : 'No messages found'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Messages List */}
            <div className="space-y-6">
              {messagesData?.messages?.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showDetails={showDetails}
                />
              ))}
            </div>

            {/* Pagination */}
            {messagesData && messagesData.total > (filters.per_page || 50) && (
              <div className="border-t border-gray-200 pt-6">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNext={pagination.hasNext}
                  hasPrev={pagination.hasPrev}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};