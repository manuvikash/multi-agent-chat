from __future__ import annotations

import asyncio
import json
from typing import List, Dict, Any, Optional
import time
import httpx

from .persona import render_system
from .schemas import LLMStructuredResponse, LLMParams, ChatMessage
from .state import RoomState
from .llm_client import chat
from .moral_agents import MORAL_AGENTS


async def detect_moral_dilemma(client: httpx.AsyncClient, room: RoomState, message: str) -> bool:
    """Ask the LLM briefly whether the user's message contains a moral/ethical dilemma.

    Returns True if the model indicates a moral dilemma (YES).
    """
    # Quick keyword check for obvious moral questions - BUT only as a hint, not automatic trigger
    moral_keywords = ['cheating', 'betray', 'lie to', 'lying to', 'steal', 'hurt someone', 
                      'ghost someone', 'break up', 'fire someone', 'tell the truth']
    message_lower = message.lower()
    has_strong_keyword = any(kw in message_lower for kw in moral_keywords)
    
    # Stricter prompt - require DEEP moral implications
    prompt = f"""Is this question a DEEPLY MORAL or ETHICAL dilemma that involves right vs wrong, harm to others, or serious ethical consequences?

Examples that ARE moral dilemmas:
- "Should I tell my friend their partner is cheating?"
- "Is it okay to lie to protect someone's feelings?"
- "Should I report my coworker for stealing?"

Examples that are NOT moral dilemmas:
- "Should I take the bus or the train?" (just a preference)
- "Should I order pizza or pasta?" (trivial choice)
- "What should I wear today?" (no ethical weight)
- "Should I study or watch TV?" (personal decision)

User's question:
{message}

Does this question involve serious ethical implications, potential harm to others, or deeply moral consequences that warrant debate between 'Good' and 'Evil' perspectives?

Answer ONLY: YES or NO
"""
    try:
        print(f"[DEBUG] Checking if DEEPLY moral dilemma: '{message[:100]}'...")
        resp = await chat(
            client=client,
            messages=[{"role": "user", "content": prompt}],
            params={"temperature": 0.0, "max_tokens": 10},
            stream=False,
        )
        if isinstance(resp, dict):
            text = resp.get("choices", [{}])[0].get("message", {}).get("content", "NO").strip().upper()
            is_moral = "YES" in text
            
            # Only use keyword as additional confirmation, not sole trigger
            final_decision = is_moral and (has_strong_keyword or "should i tell" in message_lower or "is it okay to" in message_lower or "is it right to" in message_lower)
            
            print(f"[DEBUG] Moral dilemma detection: LLM='{text}', strong_keyword={has_strong_keyword} -> {final_decision}")
            return final_decision
    except Exception as e:
        print(f"[ERROR] detect_moral_dilemma failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    return False


async def call_agent_and_broadcast(client: httpx.AsyncClient, agent_persona, room: RoomState, user_message: str, broadcast_fn):
    """Call the LLM as a specific agent persona and broadcast the plain-text reply."""
    sys = render_system(agent_persona, room.memory)
    user_prompt = f"User asked: {user_message}\n\nProvide a concise (1-3 sentence) argument from your persona's perspective. Keep it short and clear. DO NOT respond with JSON - just plain text." 
    messages = [{"role": "system", "content": sys}, {"role": "user", "content": user_prompt}]
    try:
        resp = await chat(client=client, messages=messages, params={"temperature": 0.6, "max_tokens": 180}, stream=False)
        content = None
        if isinstance(resp, dict):
            content = resp.get("choices", [])[0].get("message", {}).get("content", "").strip()
        else:
            content = str(resp).strip()

        if content:
            # Try to parse JSON if present (extract "content" field)
            try:
                if content.startswith('{'):
                    parsed = json.loads(content)
                    if isinstance(parsed, dict) and "content" in parsed:
                        content = parsed["content"]
                        print(f"[DEBUG] Extracted content from JSON: {content}")
            except:
                pass  # Use raw content if not JSON
            
            # append to room state and broadcast
            room.append_message(agent_persona.name, "assistant", content)
            await broadcast_fn({"type": "chat", "user": agent_persona.name, "content": content, "ts": time.time()})
        return content
    except Exception as e:
        print(f"[ERROR] call_agent failed for {agent_persona.name}: {e}")
        return None


async def handle_moral_dilemma(client: httpx.AsyncClient, room: RoomState, user_message: str, broadcast_fn):
    """Orchestrate a short debate between GoodBot and EvilBot, then have the main bot synthesize a final answer."""
    print(f"[DEBUG] Handling moral dilemma for message: {user_message}")
    # 1. Notify chat
    await broadcast_fn({"type": "system", "event": "debate.start", "message": "Debate mode: GoodBot vs EvilBot"})

    # 2. GoodBot speaks
    good = MORAL_AGENTS.get("GoodBot")
    evil = MORAL_AGENTS.get("EvilBot")
    good_resp = await call_agent_and_broadcast(client, good, room, user_message, broadcast_fn)

    # 3. EvilBot speaks
    evil_resp = await call_agent_and_broadcast(client, evil, room, user_message, broadcast_fn)

    # 4. Main bot synthesizes
    synth_prompt = f"""
User asked: {user_message}

GoodBot argued: {good_resp}
EvilBot argued: {evil_resp}

As the balanced assistant, synthesize these perspectives into one concise recommendation (1-3 sentences). Acknowledge both views briefly. DO NOT use JSON - respond with plain text only.
"""
    # Use the room's persona for final synthesis
    sys = render_system(room.persona, room.memory)
    messages = [{"role": "system", "content": sys}, {"role": "user", "content": synth_prompt}]
    try:
        res = await chat(client=client, messages=messages, params={"temperature": 0.5, "max_tokens": 220}, stream=False)
        final = None
        if isinstance(res, dict):
            final = res.get("choices", [])[0].get("message", {}).get("content", "").strip()
        else:
            final = str(res).strip()

        if final:
            # Parse JSON if present (extract "content" field)
            try:
                if final.startswith('{'):
                    parsed = json.loads(final)
                    if isinstance(parsed, dict) and "content" in parsed:
                        final = parsed["content"]
                        print(f"[DEBUG] Extracted synthesis content from JSON: {final}")
            except:
                pass  # Use raw content if not JSON
            
            room.append_message(room.persona.name, "assistant", final)
            room.last_ai_ts = time.time()
            room.consecutive_ai += 1
            await broadcast_fn({"type": "chat", "user": room.persona.name, "content": final, "ts": time.time()})
    except Exception as e:
        print(f"[ERROR] synthesis failed: {e}")


async def should_ai_respond(client: httpx.AsyncClient, room: RoomState) -> bool:
    """Use LLM to intelligently decide if the bot should respond."""
    now = time.time()
    
    # Basic safety check - don't spam
    if not room.can_speak(now, room.persona.talkativeness.max_consecutive_ai_msgs):
        print(f"[DEBUG] can_speak returned False - cooldown active")
        return False
    
    # Get recent conversation context (last 5 messages)
    recent_messages = room.history[-5:] if len(room.history) > 0 else []
    if not recent_messages:
        return False
    
    # Format messages for the decision prompt
    formatted_msgs = "\n".join([
        f"{msg.user}: {msg.content}" for msg in recent_messages
    ])
    
    time_since_last = now - room.last_ai_ts if room.last_ai_ts > 0 else 999
    
    decision_prompt = f"""You are a conversation moderator deciding if "{room.persona.name}" should respond.

Bot info:
- Name: {room.persona.name}
- Backstory: {room.persona.backstory[:150]}
- Tone: {room.persona.tone}
- Max consecutive messages: {room.persona.talkativeness.max_consecutive_ai_msgs}
- Time since last spoke: {time_since_last:.1f} seconds ago

Recent conversation:
{formatted_msgs}

Should {room.persona.name} respond now? Consider:
- Is someone addressing them (directly or indirectly)?
- Is the conversation relevant to their interests?
- Would silence be awkward or rude?
- Have they spoken too recently?

Answer ONLY with: YES or NO"""

    try:
        print(f"[DEBUG] Asking LLM if bot should respond...")
        
        # Use minimal params for quick decision
        decision_params = {
            "temperature": 0.3,
            "max_tokens": 10
        }
        
        response = await chat(
            client=client,
            messages=[{"role": "user", "content": decision_prompt}],
            params=decision_params,
            stream=False
        )
        
        # chat() returns Dict when stream=False
        if isinstance(response, dict):
            decision_text = response.get("choices", [{}])[0].get("message", {}).get("content", "NO").strip().upper()
            should_respond = "YES" in decision_text
            
            print(f"[DEBUG] LLM decision: {decision_text} -> {should_respond}")
            return should_respond
        else:
            print(f"[ERROR] Unexpected response type: {type(response)}")
            return False
        
    except Exception as e:
        print(f"[ERROR] LLM decision failed: {e}")
        import traceback
        traceback.print_exc()
        # Fallback to simple mention check
        last_msg = recent_messages[-1] if recent_messages else None
        if last_msg:
            return f"@{room.persona.name}" in last_msg.content
        return False


async def extract_facts(client: httpx.AsyncClient, room: RoomState, recent_messages: List[ChatMessage]) -> Dict[str, str]:
    """Use LLM to extract facts about users from recent conversation."""
    if not recent_messages:
        return {}
    
    # Format recent conversation
    conversation = "\n".join([
        f"{msg.user}: {msg.content}" for msg in recent_messages[-10:]
    ])
    
    # Get current known facts
    current_facts = "\n".join([
        f"- {user}: {facts}" for user, facts in room.memory.per_user.items()
    ]) or "None yet"
    
    extraction_prompt = f"""Analyze this conversation and extract key facts about each person.

Current known facts:
{current_facts}

Recent conversation:
{conversation}

Extract NEW facts about each person mentioned. Include:
- Names and identities
- Preferences (favorite colors, hobbies, etc.)
- Personal information they share
- Relationships between people

CRITICAL: Respond with ONLY a valid JSON object, nothing else. No markdown, no explanation, no code blocks.
Format:
{{"username1": "comma-separated facts about them", "username2": "comma-separated facts about them"}}

If no new facts to extract, respond with exactly: {{}}
"""

    try:
        print(f"[DEBUG] Extracting facts from conversation...")
        response = await chat(
            client=client,
            messages=[{"role": "user", "content": extraction_prompt}],
            params={"temperature": 0.2, "max_tokens": 300},
            stream=False
        )
        
        if isinstance(response, dict):
            content = response.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # Handle empty or whitespace-only content
            if not content or not content.strip():
                print(f"[DEBUG] LLM returned empty content for fact extraction")
                return {}
            
            content = content.strip()
            print(f"[DEBUG] Raw fact extraction response: {content[:200]}")
            
            # Try to extract JSON from markdown code blocks if present
            if "```json" in content:
                start = content.find("```json") + 7
                end = content.find("```", start)
                if end > start:
                    content = content[start:end].strip()
            elif "```" in content:
                start = content.find("```") + 3
                end = content.find("```", start)
                if end > start:
                    content = content[start:end].strip()
            
            # Try to parse JSON
            try:
                facts_data = json.loads(content)
                print(f"[DEBUG] Extracted facts: {facts_data}")
                return facts_data
            except json.JSONDecodeError as je:
                print(f"[ERROR] JSON parse failed: {je}. Content was: {content[:200]}")
                return {}
        
    except Exception as e:
        print(f"[ERROR] Fact extraction failed: {e}")
        import traceback
        traceback.print_exc()
    
    return {}


async def build_messages(room: RoomState) -> List[Dict[str, Any]]:
    # system
    sys = render_system(room.persona, room.memory)
    messages: List[Dict[str, Any]] = [{"role": "system", "content": sys}]
    tail = room.tail_by_tokens(8000)
    for m in tail:
        role = m.role
        content = m.content
        # CRITICAL: Show clear speaker attribution in messages
        if role == "user":
            # Format: "username: message content" for crystal clear attribution
            formatted_content = f"{m.user}: {content}"
            messages.append({"role": "user", "content": formatted_content})
        else:
            # Bot's own messages
            messages.append({"role": "assistant", "content": content})
    return messages


async def call_llm(client, room: RoomState, params: LLMParams, stream: bool = False):
    messages = await build_messages(room)
    p = params.model_dump() if hasattr(params, "model_dump") else params.dict()
    res = await chat(client, messages, p, stream=stream)
    return res


def parse_structured(obj: Any) -> Optional[LLMStructuredResponse]:
    try:
        if isinstance(obj, dict):
            return LLMStructuredResponse(**obj)
        if isinstance(obj, str):
            # try parse JSON
            j = json.loads(obj)
            return LLMStructuredResponse(**j)
    except Exception:
        return None
    return None


async def apply_structured_response(client: httpx.AsyncClient, resp_obj: Any, room: RoomState, broadcast_fn):
    parsed = parse_structured(resp_obj)
    
    # If structured parsing worked, use it
    if parsed:
        if not parsed.speak_now:
            return
        content = parsed.content
        # memory update
        if parsed.memory_update:
            room.memory.per_user[room.persona.name] = parsed.memory_update
    else:
        # Fallback: treat as plain text response
        print(f"[DEBUG] Structured parse failed, using raw content as fallback")
        if isinstance(resp_obj, str):
            content = resp_obj.strip()
        else:
            # Last resort: try to extract from response dict
            content = str(resp_obj).strip()
        
        if not content:
            print(f"[DEBUG] No content to broadcast")
            return
    
    # Broadcast the message
    room.append_message(room.persona.name, "assistant", content)
    room.last_ai_ts = time.time()
    room.consecutive_ai += 1
    
    await broadcast_fn({"type": "chat", "user": room.persona.name, "content": content, "ts": time.time()})
    
    # AFTER responding, extract facts from recent conversation
    try:
        recent_msgs = room.history[-10:] if len(room.history) >= 10 else room.history
        extracted_facts = await extract_facts(client, room, recent_msgs)
        
        # Merge extracted facts into existing memory
        for user, new_facts in extracted_facts.items():
            if user in room.memory.per_user:
                # Append to existing facts
                existing = room.memory.per_user[user]
                room.memory.per_user[user] = f"{existing}, {new_facts}"
            else:
                # Create new entry
                room.memory.per_user[user] = new_facts
        
        if extracted_facts:
            print(f"[DEBUG] Updated memory with facts: {extracted_facts}")
    except Exception as e:
        print(f"[ERROR] Failed to extract/store facts: {e}")


async def should_bot_respond(client: httpx.AsyncClient, room: RoomState, bot_persona, user_message: str) -> bool:
    """Determine if this specific bot should respond to the user's message based on its personality and the context."""
    
    # Always respond if directly mentioned (check @ mention or any part of their name)
    user_message_lower = user_message.lower()
    
    # Check for @ mention with full name
    if f"@{bot_persona.name}" in user_message:
        return True
    
    # Split name into parts and check if ANY part is mentioned
    # e.g., "Sasuke Uchiha" -> ["sasuke", "uchiha"]
    name_parts = bot_persona.name.lower().split()
    for part in name_parts:
        # Only check name parts that are at least 3 characters (avoid false matches on short words)
        if len(part) >= 3 and part in user_message_lower:
            print(f"[DEBUG] Bot {bot_persona.name} mentioned via name part: '{part}'")
            return True
    
    # Get recent context
    recent_msgs = room.tail_by_tokens(2000)[-5:] if len(room.history) > 0 else []
    context = "\n".join([f"{m.user}: {m.content}" for m in recent_msgs])
    
    # Ask the bot's persona if it wants to respond
    prompt = f"""You are {bot_persona.name} with this personality: {bot_persona.backstory}

Recent conversation:
{context}

Latest message: {user_message}

Based on your personality and the conversation context, should you respond to this message?
Consider:
- Is this relevant to your expertise or personality?
- Would your unique perspective add value?
- Is someone asking a question you're suited to answer?
- Don't respond to every message - only when it makes sense for your character

Answer ONLY: YES or NO"""
    
    try:
        resp = await chat(
            client=client,
            messages=[{"role": "user", "content": prompt}],
            params={"temperature": 0.3, "max_tokens": 10},
            stream=False,
        )
        if isinstance(resp, dict):
            text = resp.get("choices", [{}])[0].get("message", {}).get("content", "NO").strip().upper()
            return "YES" in text
    except Exception as e:
        print(f"[ERROR] should_bot_respond failed for {bot_persona.name}: {e}")
        return False
    return False


async def call_bot_llm(client: httpx.AsyncClient, room: RoomState, bot_persona, user_message: str) -> str:
    """Generate a response from a specific bot persona."""
    sys = render_system(bot_persona, room.memory)
    
    # Get recent conversation context
    recent_msgs = room.tail_by_tokens(4000)[-10:] if len(room.history) > 0 else []
    conversation_context = "\n".join([f"{m.user}: {m.content}" for m in recent_msgs])
    
    user_prompt = f"""Recent conversation:
{conversation_context}

Latest message: {user_message}

Respond naturally in your character. Keep it conversational and engaging (2-4 sentences max). DO NOT use JSON - just speak as {bot_persona.name}."""
    
    messages = [
        {"role": "system", "content": sys},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        resp = await chat(
            client=client,
            messages=messages,
            params={"temperature": 0.7, "max_tokens": 200},
            stream=False,
        )
        
        content = None
        if isinstance(resp, dict):
            content = resp.get("choices", [])[0].get("message", {}).get("content", "").strip()
        else:
            content = str(resp).strip()
        
        # Try to extract from JSON if present
        if content:
            try:
                if content.startswith('{'):
                    parsed = json.loads(content)
                    if isinstance(parsed, dict) and "content" in parsed:
                        content = parsed["content"]
            except:
                pass  # Use raw content if not JSON
        
        return content or "..."
    except Exception as e:
        print(f"[ERROR] call_bot_llm failed for {bot_persona.name}: {e}")
        return f"*{bot_persona.name} seems distracted*"
