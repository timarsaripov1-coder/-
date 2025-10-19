import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChats, useMessages } from '@/hooks/useApi';
import { useWebSocket } from '@/hooks/useWebSocket';
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ChatCard } from '@/components/chat/ChatCard';
import { ChatFiltersComponent, ChatFilters } from '@/components/chat/ChatFilters';
import { 
  MessageSquare, 
  Search,
  Filter,
  RefreshCw,
  Plus
} from 'lucide-react';

const defaultFilters: ChatFilters = {
  chatType: 'all',
  hasSettings: 'all',
  sortBy: 'updated_desc',
};

export const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const { subscribe } = useWebSocket();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ChatFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);

  // API calls
  const { 
    data: chatsData, 
    isLoading: chatsLoading, 
    refetch: refetchChats,
    error: chatsError
  } = useChats(searchQuery);

  // Get message counts for each chat
  const { data: messagesData } = useMessages({ per_page: 1000 });

  // Calculate message counts per chat
  const chatMessageCounts = useMemo(() => {
    if (!messagesData?.messages) return {};
    
    const counts: Record<string, { count: number; lastMessage?: string }> = {};
    
    messagesData.messages.forEach((message) => {
      if (!counts[message.chat_id]) {
        counts[message.chat_id] = { count: 0 };
      }
      counts[message.chat_id].count++;
      
      // Track most recent message time
      if (!counts[message.chat_id].lastMessage || 
          new Date(message.created_at) > new Date(counts[message.chat_id].lastMessage!)) {
        counts[message.chat_id].lastMessage = message.created_at;
      }
    });
    
    return counts;
  }, [messagesData]);

  // Real-time updates
  useEffect(() => {
    const handleNewMessage = () => {
      refetchChats();
    };

    const handleChatSettingsChanged = () => {
      refetchChats();
    };

    subscribe('new_message', handleNewMessage);
    subscribe('chat_settings_changed', handleChatSettingsChanged);
    subscribe('admin_message_sent', handleNewMessage);

    return () => {
      // Cleanup handled by useWebSocket hook
    };
  }, [subscribe, refetchChats]);

  // Filter and sort chats
  const filteredChats = useMemo(() => {
    if (!chatsData?.chats) return [];

    let filtered = [...chatsData.chats];

    // Apply filters
    if (filters.chatType !== 'all') {
      filtered = filtered.filter(chat => chat.chat_type === filters.chatType);
    }

    // Sort
    switch (filters.sortBy) {
      case 'updated_desc':
        filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case 'created_desc':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'created_asc':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'title_asc':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'title_desc':
        filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
    }

    return filtered;
  }, [chatsData?.chats, filters]);

  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(defaultFilters);

  const handleChatClick = (chatId: string) => {
    navigate(`/chats/${chatId}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleRefresh = () => {
    refetchChats();
  };

  if (chatsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="text-red-600">Error loading chats. Please try again.</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
          <p className="mt-1 text-sm text-gray-500">
            {chatsData ? `${filteredChats.length} of ${chatsData.total} chats` : 'Loading chats...'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={chatsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${chatsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search chats by title, username, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={handleClearSearch}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'ring-2 ring-primary-500' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-primary-600 text-white rounded-full px-1.5 py-0.5 text-xs">
                {Object.values(filters).filter((v, i) => v !== Object.values(defaultFilters)[i]).length}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <ChatFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        )}
      </div>

      {/* Chat List */}
      <div>
        {chatsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No chats found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || hasActiveFilters 
                ? 'Try adjusting your search or filters'
                : 'Chats will appear here when users start conversations with the bot'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredChats.map((chat) => {
              const chatStats = chatMessageCounts[chat.id];
              return (
                <ChatCard
                  key={chat.id}
                  chat={chat}
                  messageCount={chatStats?.count || 0}
                  lastMessageTime={chatStats?.lastMessage}
                  onClick={() => handleChatClick(chat.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};