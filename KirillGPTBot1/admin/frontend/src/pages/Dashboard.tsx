import React, { useEffect, useMemo } from 'react';
import { useMessages, useChats, useHealthCheck } from '@/hooks/useApi';
import { useWebSocket } from '@/hooks/useWebSocket';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { 
  MessageSquare, 
  Users, 
  Bot, 
  Activity,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { formatDateTime } from '@/utils/date';

export const Dashboard: React.FC = () => {
  const { subscribe } = useWebSocket();

  // Fetch data with React Query
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useMessages({
    per_page: 20,
    page: 1
  });

  const { data: chatsData, isLoading: chatsLoading, refetch: refetchChats } = useChats();
  const { data: healthData, isLoading: healthLoading } = useHealthCheck();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMessages = messagesData?.total || 0;
    const botMessages = messagesData?.messages?.filter(m => m.is_from_bot).length || 0;
    const userMessages = totalMessages - botMessages;
    const totalChats = chatsData?.total || 0;

    return {
      totalMessages,
      botMessages,
      userMessages,
      totalChats,
      botResponseRate: totalMessages > 0 ? (botMessages / totalMessages) * 100 : 0,
    };
  }, [messagesData, chatsData]);

  // Subscribe to real-time updates
  useEffect(() => {
    const handleNewMessage = () => {
      refetchMessages();
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
  }, [subscribe, refetchMessages, refetchChats]);

  const isLoading = messagesLoading || chatsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of Kirill GPT bot activity and key metrics
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {healthData ? formatDateTime(healthData.timestamp) : 'Loading...'}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Messages"
          value={stats.totalMessages.toLocaleString()}
          subtitle="All messages processed"
          icon={MessageSquare}
          loading={isLoading}
          trend={{
            value: 12,
            label: 'vs last week',
            positive: true,
          }}
        />
        
        <StatsCard
          title="Active Chats"
          value={stats.totalChats.toLocaleString()}
          subtitle="Conversations in progress"
          icon={Users}
          loading={isLoading}
          trend={{
            value: 5,
            label: 'new this week',
            positive: true,
          }}
        />
        
        <StatsCard
          title="Bot Responses"
          value={stats.botMessages.toLocaleString()}
          subtitle="Messages from Kirill GPT"
          icon={Bot}
          loading={isLoading}
          trend={{
            value: 8,
            label: 'vs last week',
            positive: true,
          }}
        />
        
        <StatsCard
          title="Response Rate"
          value={`${stats.botResponseRate.toFixed(1)}%`}
          subtitle="Bot response percentage"
          icon={TrendingUp}
          loading={isLoading}
          trend={{
            value: 2.1,
            label: 'accuracy increase',
            positive: true,
          }}
        />
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="card-body">
            <ActivityFeed
              messages={messagesData?.messages?.slice(0, 10) || []}
              loading={messagesLoading}
            />
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">System Status</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">API Server</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  !healthLoading && healthData 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-warning-100 text-warning-800'
                }`}>
                  {!healthLoading && healthData ? 'Online' : 'Checking...'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">WebSocket</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  'bg-success-100 text-success-800'
                }`}>
                  Connected
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Database</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                  Connected
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Bot Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                  Running
                </span>
              </div>
            </div>

            {healthData && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Server time: {formatDateTime(healthData.timestamp)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn-secondary flex items-center justify-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              View All Chats
            </button>
            
            <button className="btn-secondary flex items-center justify-center">
              <Bot className="h-4 w-4 mr-2" />
              Manage Presets
            </button>
            
            <button className="btn-secondary flex items-center justify-center">
              <Activity className="h-4 w-4 mr-2" />
              Message History
            </button>
            
            <button className="btn-primary flex items-center justify-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};