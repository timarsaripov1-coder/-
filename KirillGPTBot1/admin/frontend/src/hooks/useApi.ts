import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import {
  Chat,
  ChatListResponse,
  ChatSettings,
  ChatSettingsUpdate,
  Message,
  MessageListResponse,
  MessageFilters,
  Preset,
  PresetCreate,
  PresetUpdate,
  AdminMessageSend,
} from '@/types/api';

// Messages hooks
export const useMessages = (filters: MessageFilters = {}) => {
  return useQuery({
    queryKey: ['messages', filters],
    queryFn: () => apiClient.getMessages(filters),
    staleTime: 30000,
  });
};

// Chats hooks
export const useChats = (search?: string) => {
  return useQuery({
    queryKey: ['chats', search],
    queryFn: () => apiClient.getChats(search),
    staleTime: 30000,
  });
};

export const useChat = (chatId: string) => {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => apiClient.getChat(chatId),
    enabled: !!chatId,
  });
};

export const useChatSettings = (chatId: string) => {
  return useQuery({
    queryKey: ['chatSettings', chatId],
    queryFn: () => apiClient.getChatSettings(chatId),
    enabled: !!chatId,
  });
};

export const useUpdateChatSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, settings }: { chatId: string; settings: ChatSettingsUpdate }) =>
      apiClient.updateChatSettings(chatId, settings),
    onSuccess: (data, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chatSettings', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    },
  });
};

// Presets hooks
export const usePresets = () => {
  return useQuery({
    queryKey: ['presets'],
    queryFn: () => apiClient.getPresets(),
    staleTime: 60000,
  });
};

export const usePreset = (presetId: string) => {
  return useQuery({
    queryKey: ['preset', presetId],
    queryFn: () => apiClient.getPreset(presetId),
    enabled: !!presetId,
  });
};

export const useCreatePreset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preset: PresetCreate) => apiClient.createPreset(preset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
};

export const useUpdatePreset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ presetId, preset }: { presetId: string; preset: PresetUpdate }) =>
      apiClient.updatePreset(presetId, preset),
    onSuccess: (data, { presetId }) => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
      queryClient.invalidateQueries({ queryKey: ['preset', presetId] });
    },
  });
};

export const useDeletePreset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (presetId: string) => apiClient.deletePreset(presetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
};

// Admin actions
export const useSendAdminMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminMessageSend) => apiClient.sendAdminMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

// Health check
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 30000,
    staleTime: 25000,
  });
};