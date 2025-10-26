from __future__ import annotations

import json
import asyncio
from typing import AsyncGenerator, List, Dict, Any, Optional

import httpx
from tenacity import retry, wait_exponential, stop_after_attempt

from .config import settings


JLLM_URL = "https://janitorai.com/hackathon/completions"


@retry(wait=wait_exponential(min=0.5, max=4), stop=stop_after_attempt(3))
async def _post(client: httpx.AsyncClient, payload: Dict[str, Any], stream: bool = False):
    headers = {
        "Authorization": settings.JLLM_API_KEY,
        "Content-Type": "application/json"
    }
    payload_copy = payload.copy()
    # Don't include model field - API ignores it per spec
    payload_copy.pop("model", None)
    payload_copy["stream"] = stream
    
    resp = await client.post(JLLM_URL, json=payload_copy, headers=headers, timeout=30.0)
    resp.raise_for_status()
    return resp


async def chat(
    client: httpx.AsyncClient, messages: List[Dict[str, Any]], params: Dict[str, Any], stream: bool = False
) -> AsyncGenerator[str, None] | Dict[str, Any]:
    payload = {"messages": messages}
    # Add params but exclude None values
    if params:
        for k, v in params.items():
            if v is not None:
                payload[k] = v
    
    # Always get non-streaming response by setting stream=false in payload
    resp = await _post(client, payload, stream=False)
    try:
        data = resp.json()
        return data
    except Exception:
        # If JSON parsing fails, the response might be SSE streaming format
        # Parse the SSE text to extract the final JSON
        text = resp.text
        if 'data: ' in text:
            # Extract all data lines and combine deltas
            lines = text.strip().split('\n')
            combined_content = ""
            for line in lines:
                if line.startswith('data: ') and line != 'data: [DONE]':
                    try:
                        chunk_data = json.loads(line[6:])  # Remove 'data: ' prefix
                        delta = chunk_data.get('choices', [{}])[0].get('delta', {}).get('content', '')
                        combined_content += delta
                    except:
                        pass
            # Return the combined content as a structured response
            if combined_content:
                return {"choices": [{"message": {"content": combined_content}}]}
        return {"text": text}
