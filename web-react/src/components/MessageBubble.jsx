import './MessageBubble.css';

const BOT_COLORS = {
  'Gooner': '#667eea',
  'Professor Syntax': '#8e44ad',
  'Glitchcore': '#e74c3c',
  'Mama Bear': '#f39c12',
  'EdgeLord Supreme': '#2c3e50',
  'Corporate Speak 3000': '#3498db',
  'Chaos Goblin': '#e67e22',
  'Zen Master Byte': '#27ae60',
  'GoodBot': '#4caf50',
  'EvilBot': '#f44336',
};

export default function MessageBubble({ message, currentUser }) {
  const isSent = message.user === currentUser;
  const isBot = message.user !== currentUser && message.user !== 'SYSTEM';
  const isSystem = message.isSystem || message.user === 'SYSTEM';

  const getBotClass = () => {
    if (message.user === 'GoodBot') return 'good-bot';
    if (message.user === 'EvilBot') return 'evil-bot';
    if (isBot) return 'bot';
    return '';
  };

  const getBotColor = () => {
    return BOT_COLORS[message.user] || '#667eea';
  };

  if (isSystem) {
    const isDebate = message.content.includes('Debate') || message.content.includes('debate');
    return (
      <div className={`message system ${isDebate ? 'debate' : ''}`}>
        <div className="message-bubble">
          {isDebate && '🎭 '}
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`message ${isSent ? 'sent' : 'received'} ${getBotClass()}`}>
      {!isSent && (
        <div
          className="message-avatar"
          style={isBot ? { background: getBotColor() } : {}}
        >
          {message.user.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="message-content">
        {!isSent && <div className="message-sender">{message.user}</div>}
        <div
          className="message-bubble"
          style={isBot ? { borderLeftColor: getBotColor() } : {}}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
