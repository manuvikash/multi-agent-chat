# How to Start the Servers

## Backend (FastAPI)

The backend needs to be run with the correct Python environment that has all dependencies installed.

### Option 1: Using your existing environment
If you were running the backend before, use the same method:

```bash
# If you have a virtual environment, activate it first
# source venv/bin/activate  # or whatever your venv is named

# Then run:
cd /Users/vichu/Documents/Coding\ stuff/goonEngine/multi-agent-chat
uvicorn app.main:app --reload
```

### Option 2: Install dependencies first
If you haven't installed dependencies yet:

```bash
cd /Users/vichu/Documents/Coding\ stuff/goonEngine/multi-agent-chat

# Create virtual environment (if needed)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload
```

The server should start on `http://localhost:8000`

## Frontend (React + Vite)

The frontend is already running in the background on port 5173.

If you need to restart it:

```bash
cd /Users/vichu/Documents/Coding\ stuff/goonEngine/multi-agent-chat/web-react
npm run dev
```

The frontend should be available at `http://localhost:5173`

## Testing the Room Management Feature

Once both servers are running:

1. Open `http://localhost:5173` in your browser
2. Enter your name
3. You'll see the new Room Selection page with two options:
   - **Create New Room** (left side)
   - **Join Existing Room** (right side with list of rooms)
4. Click "Create New Room", enter a room name, select a bot, and create
5. Open another browser (or incognito) and join the same room with a different name
6. Verify that only the admin (creator) sees the + button to add bots

## Troubleshooting

### "Failed to fetch" error
- Make sure the backend is running on port 8000
- Check `http://localhost:8000/health` - should return `{"status":"ok"}`
- Check `http://localhost:8000/api/rooms` - should return a list of rooms

### Backend won't start
- Make sure FastAPI is installed: `pip list | grep fastapi`
- Install requirements: `pip install -r requirements.txt`
- Check for port conflicts: `lsof -i :8000`

### Frontend errors
- Make sure node_modules are installed: `npm install`
- Clear cache: `rm -rf node_modules/.vite && npm run dev`

