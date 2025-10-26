from __future__ import annotations

from typing import List, Dict, Literal, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    id: str
    room_id: str
    user: str
    role: Literal["user", "assistant", "system"]
    content: str
    ts: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TalkativenessConfig(BaseModel):
    target_msgs_per_min: int = 1
    respond_on_mentions: bool = True
    proactive_on_lull_sec: int = 45
    max_consecutive_ai_msgs: int = 1


class SafetyConfig(BaseModel):
    refuse_topics: List[str] = []
    pg_rating: str = "PG"


class PersonaConfig(BaseModel):
    name: str
    backstory: str
    tone: str = "neutral"
    formality: str = "casual"
    emoji_ok: bool = True
    talkativeness: TalkativenessConfig
    addressing: Dict[str, bool]
    safety: SafetyConfig
    structured_output: bool = True


class RoomMemory(BaseModel):
    summary: str = ""
    per_user: Dict[str, str] = {}


class LLMStructuredResponse(BaseModel):
    speak_now: bool
    address: List[str] = []
    tone: Optional[str] = None
    content: str = ""
    actions: List[Dict] = []
    memory_update: Optional[str] = None
    moderation_flags: List[str] = []


class LLMParams(BaseModel):
    temperature: float = 0.7
    top_p: float = 0.9
    presence_penalty: float = 0.2
    frequency_penalty: float = 0.2
    max_tokens: int = 400
