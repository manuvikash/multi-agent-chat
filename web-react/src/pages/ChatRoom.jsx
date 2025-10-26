import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useWebSocket from '../hooks/useWebSocket';
import MessageBubble from '../components/MessageBubble';
import BotSelector from '../components/BotSelector';
import './ChatRoom.css';

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
    <div className="chat-room">
      <div className="chat-header">
        <div className="header-left">
          <div className="logo">🎭</div>
          <div className="header-info">
            <h2>AI Multiverse Chat</h2>
            <div className="status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="user-badge">{userName}</div>
          <button
            className="add-bot-btn"
            onClick={() => setShowBotSelector(!showBotSelector)}
            title="Add AI Personality"
          >
            +
          </button>
        </div>
      </div>

      {showBotSelector && (
        <BotSelector
          activeBots={activeBots}
          onAddBot={handleAddBot}
          onRemoveBot={handleRemoveBot}
          onClose={() => setShowBotSelector(false)}
        />
      )}

      <div className="messages-container">
        <div className="active-bots-bar">
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
                className="active-bot-chip"
                style={{
                  background: `${bot.color}20`,
                  borderColor: bot.color
                }}
              >
                <span className="bot-name" style={{ color: bot.color }}>{bot.name}</span>
                <button
                  className="remove-bot"
                  onClick={() => handleRemoveBot(botId)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <div className="messages-area">
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

      <div className="input-area">
        <input
          type="text"
          className="message-input"
          placeholder="Type a message... (use @BotName to mention)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!isConnected || !inputValue.trim()}
        >
          <span>➤</span>
        </button>
      </div>
    </div>
  );
}
