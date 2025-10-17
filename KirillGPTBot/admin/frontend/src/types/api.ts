export interface Chat {
  id: string;
  telegram_chat_id: number;
  chat_type: string;
  title?: string;
  username?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  telegram_user_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_bot: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  user_id?: string;
  telegram_message_id: number;
  message_type: string;
  content?: string;
  is_from_bot: boolean;
  is_reply: boolean;
  reply_to_message_id?: string;
  message_hash?: string;
  created_at: string;
  chat?: Chat;
  user?: User;
}

export interface Preset {
  id: string;
  name: string;
  description?: string;
  temperature?: number;
  max_tokens?: number;
  tone?: string;
  verbosity?: string;
  emotional_intensity?: number;
  system_prompt_override?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatSettings {
  id: string;
  chat_id: string;
  preset_id?: string;
  auto_reply_enabled: boolean;
  reply_on_mention_enabled: boolean;
  temporary_preset_until?: string;
  created_at: string;
  updated_at: string;
  preset?: Preset;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface ChatListResponse {
  chats: Chat[];
  total: number;
}

export interface PresetCreate {
  name: string;
  description?: string;
  temperature?: number;
  max_tokens?: number;
  tone?: string;
  verbosity?: string;
  emotional_intensity?: number;
  system_prompt_override?: string;
  is_default?: boolean;
}

export interface PresetUpdate {
  name?: string;
  description?: string;
  temperature?: number;
  max_tokens?: number;
  tone?: string;
  verbosity?: string;
  emotional_intensity?: number;
  system_prompt_override?: string;
  is_default?: boolean;
}

export interface ChatSettingsUpdate {
  preset_id?: string;
  auto_reply_enabled?: boolean;
  reply_on_mention_enabled?: boolean;
  temporary_preset_until?: string;
}

export interface MessageFilters {
  page?: number;
  per_page?: number;
  chat_id?: string;
  user_id?: string;
  search?: string;
  is_from_bot?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface AdminMessageSend {
  chat_id: string;
  content: string;
  as_bot?: boolean;
}