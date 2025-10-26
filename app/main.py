from __future__ import annotations

import asyncio
import json
import uuid
from pathlib import Path
from typing import Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

from .config import settings, load_default_persona
from .websocket import ConnectionManager
from .state import RoomState
from .schemas import PersonaConfig, LLMParams
from .orchestrator import should_ai_respond, call_llm, apply_structured_response, detect_moral_dilemma, handle_moral_dilemma, should_bot_respond, call_bot_llm
from .bot_personas import BOT_PERSONAS, BOT_METADATA

app = FastAPI()

# Add CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount static files (web/) to serve UI
web_dir = Path(__file__).resolve().parents[1] / "web"
app.mount("/static", StaticFiles(directory=str(web_dir)), name="static")

manager = ConnectionManager()
rooms: Dict[str, RoomState] = {}


class CreateRoomRequest(BaseModel):
    name: str
    admin: str
    initial_bot: str


@app.on_event("startup")
async def on_startup():
    # create a global httpx client on app state
    app.state.httpx_client = httpx.AsyncClient()


@app.on_event("shutdown")
async def on_shutdown():
    await app.state.httpx_client.aclose()


@app.get("/health")
async def health():
    return JSONResponse({"status": "ok"})


@app.get("/api/bots")
async def get_bots():
    """Return available bot personalities"""
    return JSONResponse(BOT_METADATA)


@app.post("/api/rooms/create")
async def create_room(request: CreateRoomRequest):
    """Create a new chat room"""
    # Validate bot exists
    if request.initial_bot not in BOT_PERSONAS:
        raise HTTPException(status_code=400, detail=f"Invalid bot: {request.initial_bot}")
    
    # Generate unique room ID
    room_id = str(uuid.uuid4())
    
    # Load default persona and params
    d = load_default_persona()
    persona = PersonaConfig(**d)
    params = LLMParams()
    
    # Create room with metadata
    room = RoomState(
        id=room_id,
        persona=persona,
        params=params,
        name=request.name,
        admin=request.admin
    )
    
    # Set initial bot
    room.active_bots = {request.initial_bot}
    
    # Store room
    rooms[room_id] = room
    
    return JSONResponse({
        "room_id": room_id,
        "name": request.name,
        "admin": request.admin,
        "initial_bot": request.initial_bot
    })


@app.get("/api/rooms")
async def get_rooms():
    """Get list of all available rooms"""
    room_list = []
    for room_id, room in rooms.items():
        room_list.append({
            "room_id": room_id,
            "name": room.name,
            "admin": room.admin,
            "created_at": room.created_at,
            "participant_count": len(room.users),
            "active_bots": list(room.active_bots)
        })
    
    # Sort by created_at (newest first)
    room_list.sort(key=lambda x: x["created_at"], reverse=True)
    
    return JSONResponse(room_list)


@app.get("/api/rooms/{room_id}")
async def get_room(room_id: str):
    """Get details of a specific room"""
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = rooms[room_id]
    return JSONResponse({
        "room_id": room_id,
        "name": room.name,
        "admin": room.admin,
        "created_at": room.created_at,
        "participants": list(room.users),
        "participant_count": len(room.users),
        "active_bots": list(room.active_bots)
    })


@app.get("/")
async def index():
    return FileResponse(str(web_dir / "index.html"))


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(room_id, websocket)
    try:
        # Check if room exists (don't auto-create anymore)
        if room_id not in rooms:
            await websocket.send_text(json.dumps({
                "type": "error", 
                "message": "Room not found. Please create or join an existing room."
            }))
            await websocket.close()
            return

        room: RoomState = rooms[room_id]

        while True:
            data = await websocket.receive_text()
            try:
                obj = json.loads(data)
            except Exception:
                await websocket.send_text(json.dumps({"type": "error", "message": "invalid json"}))
                continue

            typ = obj.get("type")
            if typ == "join":
                user = obj.get("user")
                room.users.add(user)
                await manager.broadcast(room_id, {"type": "system", "event": "joined", "user": user})
            elif typ == "chat":
                user = obj.get("user")
                content = obj.get("content")
                # append & broadcast
                msg = room.append_message(user, "user", content)
                await manager.broadcast(room_id, {"type": "chat", "user": user, "content": content, "ts": msg.ts.isoformat()})

                # orchestrate AI in background
                async def _run_orchestrator():
                    try:
                        # Check for moral dilemma FIRST (bypasses turn-taking)
                        print(f"[DEBUG] Checking if this is a moral dilemma...")
                        try:
                            is_moral = await detect_moral_dilemma(app.state.httpx_client, room, content)
                        except Exception as e:
                            print(f"[ERROR] detect_moral_dilemma error: {e}")
                            is_moral = False

                        if is_moral:
                            print(f"[DEBUG] Moral dilemma detected - running debate flow (bypassing turn-taking)")
                            await handle_moral_dilemma(app.state.httpx_client, room, content, lambda m: manager.broadcast(room_id, m))
                            return  # Exit early after debate
                        
                        # Let each active bot autonomously decide if it should respond
                        print(f"[DEBUG] Active bots: {room.active_bots}")
                        for bot_id in room.active_bots:
                            if bot_id not in BOT_PERSONAS:
                                continue
                            
                            bot_persona = BOT_PERSONAS[bot_id]
                            print(f"[DEBUG] Checking if {bot_persona.name} should respond...")
                            
                            # Check if bot should respond to this message
                            should_respond = await should_bot_respond(app.state.httpx_client, room, bot_persona, content)
                            print(f"[DEBUG] {bot_persona.name} should_respond: {should_respond}")
                            
                            if should_respond:
                                print(f"[DEBUG] {bot_persona.name} is responding...")
                                # Generate response with bot's persona
                                response = await call_bot_llm(app.state.httpx_client, room, bot_persona, content)
                                
                                # Broadcast bot response with bot name
                                bot_msg = room.append_message(bot_persona.name, "assistant", response)
                                await manager.broadcast(room_id, {
                                    "type": "chat",
                                    "user": bot_persona.name,
                                    "content": response,
                                    "ts": bot_msg.ts.isoformat(),
                                    "is_bot": True,
                                    "bot_id": bot_id
                                })
                                
                                # Small delay between bots to prevent overwhelming
                                await asyncio.sleep(0.5)
                    except Exception as e:
                        print(f"[ERROR] Exception in orchestrator: {e}")
                        import traceback
                        traceback.print_exc()
                        await manager.broadcast(room_id, {"type": "error", "message": str(e)})

                asyncio.create_task(_run_orchestrator())

            elif typ == "bot.add":
                user = obj.get("user")
                bot_id = obj.get("bot_id")
                # Check if user is admin
                if user != room.admin:
                    await websocket.send_text(json.dumps({
                        "type": "error", 
                        "message": "Only the room admin can add bots"
                    }))
                    continue
                if bot_id in BOT_PERSONAS:
                    room.active_bots.add(bot_id)
                    await manager.broadcast(room_id, {
                        "type": "system",
                        "event": "bot.added",
                        "bot_id": bot_id,
                        "bot_name": BOT_PERSONAS[bot_id].name
                    })
            elif typ == "bot.remove":
                user = obj.get("user")
                bot_id = obj.get("bot_id")
                # Check if user is admin
                if user != room.admin:
                    await websocket.send_text(json.dumps({
                        "type": "error", 
                        "message": "Only the room admin can remove bots"
                    }))
                    continue
                if bot_id in room.active_bots:
                    room.active_bots.remove(bot_id)
                    await manager.broadcast(room_id, {
                        "type": "system",
                        "event": "bot.removed",
                        "bot_id": bot_id,
                        "bot_name": BOT_PERSONAS[bot_id].name
                    })

            elif typ == "typing":
                user = obj.get("user")
                is_typing = obj.get("is_typing", False)
                await manager.broadcast(room_id, {"type": "typing", "user": user, "is_typing": is_typing})
            elif typ == "persona.update":
                persona_obj = obj.get("persona")
                try:
                    room.persona = PersonaConfig(**persona_obj)
                    await manager.broadcast(room_id, {"type": "system", "event": "persona.updated"})
                except Exception as e:
                    await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
            elif typ == "sliders.update":
                params = obj.get("params")
                try:
                    room.params = LLMParams(**params)
                    await manager.broadcast(room_id, {"type": "system", "event": "params.updated"})
                except Exception as e:
                    await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
            else:
                await websocket.send_text(json.dumps({"type": "error", "message": "unknown message type"}))

    except WebSocketDisconnect:
        await manager.disconnect(room_id, websocket)
