import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
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

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle authentication error
          this.setToken(null);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on init
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      this.setToken(savedToken);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Auth endpoints
  async verifyAuth(): Promise<{ valid: boolean; message: string }> {
    const response = await this.client.post('/auth/verify');
    return response.data;
  }

  // Messages API
  async getMessages(filters: MessageFilters = {}): Promise<MessageListResponse> {
    const response = await this.client.get('/messages', { params: filters });
    return response.data;
  }

  async createMessage(message: any): Promise<Message> {
    const response = await this.client.post('/messages', message);
    return response.data;
  }

  // Chats API
  async getChats(search?: string): Promise<ChatListResponse> {
    const params = search ? { search } : {};
    const response = await this.client.get('/chats', { params });
    return response.data;
  }

  async getChat(chatId: string): Promise<Chat> {
    const response = await this.client.get(`/chats/${chatId}`);
    return response.data;
  }

  async getChatSettings(chatId: string): Promise<ChatSettings> {
    const response = await this.client.get(`/chats/${chatId}/settings`);
    return response.data;
  }

  async updateChatSettings(
    chatId: string,
    settings: ChatSettingsUpdate
  ): Promise<ChatSettings> {
    const response = await this.client.put(`/chats/${chatId}/settings`, settings);
    return response.data;
  }

  // Presets API
  async getPresets(): Promise<Preset[]> {
    const response = await this.client.get('/presets');
    return response.data;
  }

  async getPreset(presetId: string): Promise<Preset> {
    const response = await this.client.get(`/presets/${presetId}`);
    return response.data;
  }

  async createPreset(preset: PresetCreate): Promise<Preset> {
    const response = await this.client.post('/presets', preset);
    return response.data;
  }

  async updatePreset(presetId: string, preset: PresetUpdate): Promise<Preset> {
    const response = await this.client.put(`/presets/${presetId}`, preset);
    return response.data;
  }

  async deletePreset(presetId: string): Promise<void> {
    await this.client.delete(`/presets/${presetId}`);
  }

  // Admin actions
  async sendAdminMessage(data: AdminMessageSend): Promise<{ message: string }> {
    const response = await this.client.post('/admin/send-message', data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;