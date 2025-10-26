import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Send, Skull, Wifi, WifiOff } from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';
import MessageBubble from '../components/MessageBubble';
import BotSelector from '../components/BotSelector';
import { cn } from '../lib/utils';

export default function ChatRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userName } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showBotSelector, setShowBotSelector] = useState(false);
  const [activeBots, setActiveBots] = useState(['gooner']); // Default bot
  const messagesEndRef = useRef(null);

  // Redirect if no user data
  useEffect(() => {
    if (!userName) {
      navigate('/');
    }
  }, [userName, navigate]);

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

  const { isConnected, sendMessage } = useWebSocket('main', userName, handleMessage);

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
        bot_id: botId
      });
    }
  };

  const handleRemoveBot = (botId) => {
    setActiveBots(prev => prev.filter(id => id !== botId));
    // Notify backend
    sendMessage({
      type: 'bot.remove',
      bot_id: botId
    });
  };

  if (!userName) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className={cn(
        "flex items-center justify-between px-6 py-4",
        "bg-card border-b border-border",
        "shadow-lg backdrop-blur-sm"
      )}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Skull className="w-8 h-8 text-primary" />
            <div className="absolute inset-0 blur-lg bg-primary/30 rounded-full" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Multiverse
            </h2>
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-destructive" />
                  <span className="text-destructive">Connecting...</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-4 py-2 rounded-full font-medium",
            "bg-secondary border border-border text-sm"
          )}>
            {userName}
          </div>
          <button
            onClick={() => setShowBotSelector(!showBotSelector)}
            className={cn(
              "p-2 rounded-full",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-95",
              "transition-all duration-200 border-glow"
            )}
            title="Add AI Personality"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {showBotSelector && (
        <BotSelector
          activeBots={activeBots}
          onAddBot={handleAddBot}
          onRemoveBot={handleRemoveBot}
          onClose={() => setShowBotSelector(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeBots.length > 0 && (
          <div className={cn(
            "flex flex-wrap gap-2 px-6 py-3",
            "bg-secondary/50 border-b border-border"
          )}>
            {activeBots.map(botId => {
              const botInfo = {
                'gooner': { name: 'Gooner', color: '#667eea' },
                'professor': { name: 'Professor Syntax', color: '#8e44ad' },
                'glitchcore': { name: 'Glitchcore', color: '#e74c3c' },
                'mama': { name: 'Mama Bear', color: '#f39c12' },
                'edgelord': { name: 'EdgeLord Supreme', color: '#9b59b6' },
                'corporate': { name: 'Corporate Speak 3000', color: '#3498db' },
                'goblin': { name: 'Chaos Goblin', color: '#e67e22' },
                'zen': { name: 'Zen Master Byte', color: '#1abc9c' }
              };
              const bot = botInfo[botId] || { name: botId, color: '#667eea' };
              return (
                <div
                  key={botId}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all"
                  style={{
                    backgroundColor: `${bot.color}15`,
                    borderColor: bot.color,
                    color: bot.color
                  }}
                >
                  <span>{bot.name}</span>
                  <button
                    onClick={() => handleRemoveBot(botId)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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

      <div className={cn(
        "px-6 py-4 border-t border-border",
        "bg-card backdrop-blur-sm"
      )}>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Type a message... (use @BotName to mention)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            className={cn(
              "flex-1 px-4 py-3 rounded-lg",
              "bg-secondary border border-border",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !inputValue.trim()}
            className={cn(
              "px-6 py-3 rounded-lg font-medium",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary",
              "transition-all duration-200",
              "flex items-center justify-center",
              "border-glow min-w-[60px]"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
