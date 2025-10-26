import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useWebSocket from '../hooks/useWebSocket';
import MessageBubble from '../components/MessageBubble';
import BotSelector from '../components/BotSelector';

export default function ChatRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userName, roomId, roomName, isAdmin } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showBotSelector, setShowBotSelector] = useState(false);
  const [activeBots, setActiveBots] = useState(['gooner']); // Default bot
  const messagesEndRef = useRef(null);

  // Redirect if no user data
  useEffect(() => {
    if (!userName || !roomId) {
      navigate('/');
    }
  }, [userName, roomId, navigate]);

  const handleMessage = useCallback((data) => {
    console.log('Received message:', data);
    if (data.type === 'chat') {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        user: data.user,
        content: data.content,
        timestamp: data.ts || Date.now()
      }]);
    } else if (data.type === 'system') {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        user: 'SYSTEM',
        content: data.event || data.message || JSON.stringify(data),
        timestamp: Date.now(),
        isSystem: true
      }]);
    }
  }, []);

  const { isConnected, sendMessage } = useWebSocket(roomId, userName, handleMessage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    sendMessage({
      type: 'chat',
      user: userName,
      content: inputValue
    });
    
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddBot = (botId) => {
    if (!activeBots.includes(botId)) {
      setActiveBots(prev => [...prev, botId]);
      // Notify backend
      sendMessage({
        type: 'bot.add',
        bot_id: botId,
        user: userName
      });
    }
  };

  const handleRemoveBot = (botId) => {
    setActiveBots(prev => prev.filter(id => id !== botId));
    // Notify backend
    sendMessage({
      type: 'bot.remove',
      bot_id: botId,
      user: userName
    });
  };

  if (!userName) return null;

  const BOT_INFO = {
    'gooner': { name: 'Saitama', color: '#8b5cf6' },
    'professor': { name: 'Light Yagami', color: '#a78bfa' },
    'glitchcore': { name: 'Accelerator', color: '#ec4899' },
    'mama': { name: 'Nezuko', color: '#f59e0b' },
    'edgelord': { name: 'Sasuke Uchiha', color: '#9333ea' },
    'corporate': { name: 'Reigen Arataka', color: '#06b6d4' },
    'goblin': { name: 'Goku', color: '#f97316' },
    'zen': { name: 'Whis', color: '#10b981' }
  };

  return (
    <div className="h-screen flex flex-col bg-dark-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-dark via-purple-primary to-accent-pink px-8 py-5 flex justify-between items-center shadow-lg border-b border-purple-primary/30">
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-float">🎭</div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white crt-glow tracking-wider">
              AIRA {roomName && `- ${roomName}`}
            </h2>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-accent-green animate-pulse' : 'bg-red-500'}`} />
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold flex items-center gap-2">
            {userName}
            {isAdmin && <span className="text-xs" title="Room Admin">👑</span>}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowBotSelector(!showBotSelector)}
              title="Add AI Personality"
              className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm border-2 border-white/40 text-white text-2xl font-bold hover:bg-white/35 hover:scale-110 hover:rotate-90 transition-all duration-300 flex items-center justify-center shadow-glow"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Bot Selector Modal */}
      {showBotSelector && (
        <BotSelector
          activeBots={activeBots}
          onAddBot={handleAddBot}
          onRemoveBot={handleRemoveBot}
          onClose={() => setShowBotSelector(false)}
        />
      )}

      {/* Messages Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Active Bots Bar */}
        <div className="px-6 py-3 bg-dark-card/50 border-b border-dark-border flex gap-2 flex-wrap min-h-[60px] items-center">
          {activeBots.map(botId => {
            const bot = BOT_INFO[botId] || { name: botId, color: '#8b5cf6' };
            return (
              <div 
                key={botId} 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{
                  background: `${bot.color}20`,
                  borderColor: bot.color
                }}
              >
                <span className="font-bold text-sm" style={{ color: bot.color }}>
                  {bot.name}
                </span>
                <button
                  onClick={() => handleRemoveBot(botId)}
                  className="w-5 h-5 rounded-full bg-black/20 hover:bg-red-500 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 max-w-5xl mx-auto w-full flex flex-col gap-4">
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUser={userName}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-8 py-5 bg-dark-card border-t border-dark-border flex gap-3 items-center">
        <input
          type="text"
          placeholder="Type a message... (use @BotName to mention)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
          className="flex-1 px-6 py-4 bg-dark-elevated border-2 border-dark-border rounded-3xl text-white placeholder-gray-500 focus:border-purple-primary focus:ring-4 focus:ring-purple-primary/20 outline-none transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!isConnected || !inputValue.trim()}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-primary to-accent-pink text-white shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center text-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          <span>➤</span>
        </button>
      </div>
    </div>
  );
}
