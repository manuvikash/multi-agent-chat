# 🎭 AI Multiverse Chat - React Frontend

A modern, dark-themed multiplayer chat interface where multiple users can interact with various AI personalities simultaneously in real-time.

## ✨ Features

- **Real-time Multiplayer Chat**: Multiple users can chat together in the same room
- **Multiple AI Personalities**: Add and remove various AI bots with unique personalities
- **Dark/Goth Theme**: Modern, sleek dark interface with purple and pink accents
- **WebSocket Communication**: Real-time message synchronization
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Polished UI with floating, sliding, and glow effects

## 🎨 UI Design

The interface features a **dark/goth aesthetic** with:
- Deep dark backgrounds (#0a0a0f)
- Purple-pink gradient accents
- Glassmorphism effects
- Custom animations and transitions
- Color-coded bot personalities
- Glowing interactive elements

For detailed design documentation, see [UI_REDESIGN.md](./UI_REDESIGN.md)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend server running on `ws://localhost:8000`

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

## 🏗️ Tech Stack

- **React 19.1.1** - UI framework
- **Vite 7.1.7** - Build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first styling
- **React Router DOM 7.9.4** - Client-side routing
- **WebSocket** - Real-time communication

## 📁 Project Structure

```
src/
├── components/
│   ├── BotSelector.jsx      # Modal for selecting AI personalities
│   └── MessageBubble.jsx    # Individual message component
├── pages/
│   ├── BotSelection.jsx     # Landing page (name entry)
│   └── ChatRoom.jsx         # Main chat interface
├── hooks/
│   └── useWebSocket.js      # WebSocket connection hook
├── App.jsx                  # Root component with routing
├── main.jsx                 # Application entry point
└── index.css                # Global styles with Tailwind

```

## 🎭 Available AI Personalities

- **😎 Gooner** - The chillest stoic chad
- **🎓 Professor Syntax** - Victorian scholar from 1847
- **⚡ Glitchcore** - Corrupted AI speaking l33t
- **🧸 Mama Bear** - Wholesome grandma energy
- **🖤 EdgeLord Supreme** - 2000s MySpace emo vibes
- **💼 Corporate Speak 3000** - Pure business jargon
- **👹 Chaos Goblin** - Mischievous trickster agent
- **🧘 Zen Master Byte** - Enlightened AI koans

## 🔌 Backend Integration

The frontend connects to a WebSocket server at `ws://localhost:8000/ws/{roomId}`.

### Message Types
- `join` - User joins the chat
- `chat` - User sends a message
- `bot.add` - Add an AI personality
- `bot.remove` - Remove an AI personality
- `system` - System notifications

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js` to customize the color palette:

```javascript
theme: {
  extend: {
    colors: {
      'dark': {
        bg: '#0a0a0f',
        card: '#13131d',
        elevated: '#1a1a28',
        border: '#2a2a3e',
      },
      // ... more colors
    }
  }
}
```

### Fonts
The UI uses:
- **Space Grotesk** for headings
- **Inter** for body text

Both loaded from Google Fonts (editable in `src/index.css`)

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Ensure backend is running on port 8000
- Check browser console for connection errors
- Verify CORS settings on backend

### Build Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 📄 License

Part of the multi-agent-chat project.
