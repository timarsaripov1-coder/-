from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey, DECIMAL, BigInteger, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base

class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    telegram_chat_id = Column(BigInteger, unique=True, nullable=False)
    chat_type = Column(String(20), nullable=False)
    title = Column(String(255))
    username = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    messages = relationship("Message", back_populates="chat")
    settings = relationship("ChatSettings", back_populates="chat", uselist=False)

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    telegram_user_id = Column(BigInteger, unique=True, nullable=False)
    username = Column(String(255))
    first_name = Column(String(255))
    last_name = Column(String(255))
    is_bot = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    messages = relationship("Message", back_populates="user")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    telegram_message_id = Column(Integer, nullable=False)
    message_type = Column(String(20), nullable=False)
    content = Column(Text)
    is_from_bot = Column(Boolean, default=False)
    is_reply = Column(Boolean, default=False)
    reply_to_message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="SET NULL"))
    message_hash = Column(String(64))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    chat = relationship("Chat", back_populates="messages")
    user = relationship("User", back_populates="messages")
    reply_to = relationship("Message", remote_side=[id])

class Preset(Base):
    __tablename__ = "presets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    temperature = Column(DECIMAL(3,2), default=0.7)
    max_tokens = Column(Integer, default=600)
    tone = Column(String(50))
    verbosity = Column(String(20))
    emotional_intensity = Column(Integer, default=50)
    system_prompt_override = Column(Text)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    chat_settings = relationship("ChatSettings", back_populates="preset")

class ChatSettings(Base):
    __tablename__ = "chat_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.id", ondelete="CASCADE"), unique=True)
    preset_id = Column(UUID(as_uuid=True), ForeignKey("presets.id", ondelete="SET NULL"))
    auto_reply_enabled = Column(Boolean, default=True)
    reply_on_mention_enabled = Column(Boolean, default=True)
    temporary_preset_until = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    chat = relationship("Chat", back_populates="settings")
    preset = relationship("Preset", back_populates="chat_settings")

class AdminAction(Base):
    __tablename__ = "admin_actions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_type = Column(String(50), nullable=False)
    target_type = Column(String(20))
    target_id = Column(UUID(as_uuid=True))
    details = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())