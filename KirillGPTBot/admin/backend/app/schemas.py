from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal

class ChatBase(BaseModel):
    telegram_chat_id: int
    chat_type: str
    title: Optional[str] = None
    username: Optional[str] = None

class ChatCreate(ChatBase):
    pass

class Chat(ChatBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime
    updated_at: datetime

class UserBase(BaseModel):
    telegram_user_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_bot: bool = False

class UserCreate(UserBase):
    pass

class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime
    updated_at: datetime

class MessageBase(BaseModel):
    telegram_message_id: int
    message_type: str
    content: Optional[str] = None
    is_from_bot: bool = False
    is_reply: bool = False
    message_hash: Optional[str] = None

class MessageCreate(MessageBase):
    chat_id: UUID
    user_id: Optional[UUID] = None
    reply_to_message_id: Optional[UUID] = None

class Message(MessageBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    chat_id: UUID
    user_id: Optional[UUID]
    reply_to_message_id: Optional[UUID]
    created_at: datetime
    chat: Optional[Chat] = None
    user: Optional[User] = None

class PresetBase(BaseModel):
    name: str
    description: Optional[str] = None
    temperature: Optional[Decimal] = Decimal("0.7")
    max_tokens: Optional[int] = 600
    tone: Optional[str] = None
    verbosity: Optional[str] = None
    emotional_intensity: Optional[int] = 50
    system_prompt_override: Optional[str] = None
    is_default: bool = False

class PresetCreate(PresetBase):
    pass

class PresetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    temperature: Optional[Decimal] = None
    max_tokens: Optional[int] = None
    tone: Optional[str] = None
    verbosity: Optional[str] = None
    emotional_intensity: Optional[int] = None
    system_prompt_override: Optional[str] = None
    is_default: Optional[bool] = None

class Preset(PresetBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime
    updated_at: datetime

class ChatSettingsBase(BaseModel):
    auto_reply_enabled: bool = True
    reply_on_mention_enabled: bool = True
    temporary_preset_until: Optional[datetime] = None

class ChatSettingsCreate(ChatSettingsBase):
    chat_id: UUID
    preset_id: Optional[UUID] = None

class ChatSettingsUpdate(BaseModel):
    preset_id: Optional[UUID] = None
    auto_reply_enabled: Optional[bool] = None
    reply_on_mention_enabled: Optional[bool] = None
    temporary_preset_until: Optional[datetime] = None

class ChatSettings(ChatSettingsBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    chat_id: UUID
    preset_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    preset: Optional[Preset] = None

class AdminActionCreate(BaseModel):
    action_type: str
    target_type: Optional[str] = None
    target_id: Optional[UUID] = None
    details: Optional[dict] = None

class AdminAction(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    action_type: str
    target_type: Optional[str]
    target_id: Optional[UUID]
    details: Optional[dict]
    created_at: datetime

class MessageListResponse(BaseModel):
    messages: List[Message]
    total: int
    page: int
    per_page: int
    has_next: bool

class ChatListResponse(BaseModel):
    chats: List[Chat]
    total: int