from __future__ import annotations

import asyncio
import json
from typing import Dict, Set, Callable

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # rooms -> set of websockets
        self.rooms: Dict[str, Set[WebSocket]] = {}
        self.lock = asyncio.Lock()

    async def connect(self, room_id: str, ws: WebSocket):
        await ws.accept()
        async with self.lock:
            self.rooms.setdefault(room_id, set()).add(ws)

    async def disconnect(self, room_id: str, ws: WebSocket):
        async with self.lock:
            if room_id in self.rooms and ws in self.rooms[room_id]:
                self.rooms[room_id].remove(ws)

    async def broadcast(self, room_id: str, message: Dict):
        async with self.lock:
            sockets = list(self.rooms.get(room_id, []))
        data = json.dumps(message)
        for s in sockets:
            try:
                await s.send_text(data)
            except Exception:
                # ignore send errors
                pass
