from __future__ import annotations

import os
import json
from pathlib import Path
from typing import Any, Dict

from pydantic import BaseModel, ConfigDict


class Settings(BaseModel):
    model_config = ConfigDict(extra='allow')
    
    JLLM_API_KEY: str = "calhacks2047"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEFAULT_PERSONA_FILE: str = "persona.default.json"
    DEFAULT_PERSONA_JSON: str = ""


def load_settings():
    # Try to load from env, fallback to default
    key = os.getenv("JLLM_API_KEY", "calhacks2047")
    return Settings(JLLM_API_KEY=key)


settings = load_settings()


def load_default_persona() -> Dict[str, Any]:
    # Try env JSON first
    if settings.DEFAULT_PERSONA_JSON:
        try:
            return json.loads(settings.DEFAULT_PERSONA_JSON)
        except Exception:
            pass
    # Try file next
    p = Path(__file__).resolve().parents[1] / settings.DEFAULT_PERSONA_FILE
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            pass
    # Fallback defaults
    return {
        "name": "Bot",
        "backstory": "You are a witty, warm guide for a group RP chat. Keep conversation inclusive and fun.",
        "tone": "witty",
        "formality": "casual",
        "emoji_ok": True,
        "talkativeness": {
            "target_msgs_per_min": 1,
            "respond_on_mentions": True,
            "proactive_on_lull_sec": 45,
            "max_consecutive_ai_msgs": 1,
        },
        "addressing": {"tag_users_by_name": True, "prefer_short_answers": False},
        "safety": {"refuse_topics": [], "pg_rating": "PG"},
        "structured_output": True,
    }
