from __future__ import annotations

import time
import uuid
from typing import List, Dict, Set, Literal

from .schemas import ChatMessage, RoomMemory, PersonaConfig, LLMParams


class RoomState:
    def __init__(self, id: str, persona: PersonaConfig, params: LLMParams):
        self.id = id
        self.users: Set[str] = set()
        self.history: List[ChatMessage] = []
        self.memory: RoomMemory = RoomMemory()
        self.persona = persona
        self.params = params
        self.last_ai_ts: float = 0.0
        self.consecutive_ai: int = 0
        self.active_bots: Set[str] = {"gooner"}  # Default active bot

    def append_message(self, user: str, role: Literal["user", "assistant", "system"], content: str) -> ChatMessage:
        msg = ChatMessage(id=str(uuid.uuid4()), room_id=self.id, user=user, role=role, content=content)
        self.history.append(msg)
        # Reset consecutive AI counter when a human speaks
        if role == "user":
            self.consecutive_ai = 0
        return msg

    def tail_by_tokens(self, max_tokens: int = 8000) -> List[ChatMessage]:
        # Naive token approximation: 1 token ~ 4 chars
        limit_chars = max_tokens * 4
        out = []
        total = 0
        for m in reversed(self.history):
            l = len(m.content or "")
            if total + l > limit_chars:
                break
            out.insert(0, m)
            total += l
        return out

    def since_last_human_secs(self) -> float:
        now = time.time()
        # find last human message
        for m in reversed(self.history):
            if m.role == "user":
                return now - m.ts.timestamp()
        return now - 0.0

    def can_speak(self, now_ts: float, max_consecutive: int) -> bool:
        if self.consecutive_ai >= max_consecutive:
            return False
        # Simple cooldown: 2 seconds between AI messages
        if now_ts - self.last_ai_ts < 2.0:
            return False
        return True
