# Multichat — Multiplayer AI Group Chat

Real-time multi-user chat with a configurable AI character powered by FastAPI, WebSockets, and the JLLM API.

## Features
- Real-time WebSocket chat
- Single shared room (multiple rooms supported)
- Configurable AI persona (backstory, tone, behavior)
- Turn-taking: AI responds to @mentions, questions, or proactively when quiet
- Structured JSON responses from LLM
- In-memory state with rolling history window

## Quick Start

### 1. Install Dependencies

```powershell
python -m venv .venv
.\.venv\Scripts\Activate
pip install -r requirements.txt
```

### 2. Run the server

**Option A: Using the run script (easiest)**
```powershell
.\run.ps1
```

**Option B: Manual command**
```powershell
$env:PYTHONPATH = "d:\Goonengine\multichat"
python -m uvicorn app.main:app --reload --host 0.0.0.0
```

**Option C: Using Make**
```powershell
make run
```

### 4. Open the app

Navigate to http://localhost:8000

- Enter your name and room ID (default: "main")
- Click Join
- Send messages in the chat
- Mention `@Bot` to get AI responses

**Note:** The API key is hardcoded to `calhacks2047` as specified. To override, set the `JLLM_API_KEY` environment variable before running.

## Docker

Build and run:

```powershell
docker build -t multichat .
docker run -p 8000:8000 multichat
```

Or with docker-compose:

```powershell
docker-compose up --build
```

## Testing

```powershell
pytest -q
```

## API Details

The app uses the JLLM API at `https://janitorai.com/hackathon/completions` with:
- Authorization: `calhacks2047` (or your custom key from `.env`)
- Content-Type: `application/json`
- Payload: `{"messages": [...], "temperature": 0.7, ...}`

## Project Structure

```
multichat/
  app/
    main.py           # FastAPI app & WebSocket endpoint
    config.py         # Settings & defaults
    schemas.py        # Pydantic models
    llm_client.py     # JLLM API client
    persona.py        # System prompt renderer
    state.py          # In-memory room state
    orchestrator.py   # Turn-taking & response logic
    websocket.py      # Connection manager
    summarizer.py     # History summarization
    utils.py          # Helpers
  web/
    index.html        # Chat UI
    app.js            # WebSocket client
    styles.css        # Styling
  tests/              # Pytest tests
  Dockerfile
  docker-compose.yml
  Makefile
  requirements.txt
```

## How It Works

1. **Join a room**: Connect via WebSocket at `/ws/{room_id}`
2. **Send messages**: Broadcast to all users in real-time
3. **AI responds** when:
   - You mention `@Bot`
   - You ask a question
   - Room is quiet for 45s (proactive)
4. **Persona controls**: Update AI backstory, tone, and behavior via UI

Enjoy chatting!
