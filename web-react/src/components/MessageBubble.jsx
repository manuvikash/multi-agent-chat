const BOT_COLORS = {
  'Saitama': '#8b5cf6',
  'Light Yagami': '#a78bfa',
  'Accelerator': '#ec4899',
  'Nezuko': '#f59e0b',
  'Sasuke Uchiha': '#9333ea',
  'Reigen Arataka': '#06b6d4',
  'Goku': '#f97316',
  'Whis': '#10b981',
  'GoodBot': '#10b981',
  'EvilBot': '#ef4444',
};

export default function MessageBubble({ message, currentUser }) {
  const isSent = message.user === currentUser;
  const isBot = message.user !== currentUser && message.user !== 'SYSTEM';
  const isSystem = message.isSystem || message.user === 'SYSTEM';

  const getBotColor = () => {
    return BOT_COLORS[message.user] || '#8b5cf6';
  };

  if (isSystem) {
    const isDebate = message.content.includes('Debate') || message.content.includes('debate');
    return (
      <div className={`flex justify-center animate-[slideIn_0.3s_ease-out] ${isDebate ? 'my-2' : 'my-1'}`}>
        <div className={`px-5 py-2.5 rounded-2xl text-sm ${
          isDebate 
            ? 'bg-gradient-to-r from-purple-primary to-accent-pink text-white font-semibold shadow-glow'
            : 'bg-dark-elevated/50 text-gray-400 italic border border-dark-border'
        }`}>
          {isDebate && '🎭 '}
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 max-w-[75%] animate-[slideIn_0.3s_ease-out] ${
      isSent ? 'self-end flex-row-reverse' : 'self-start'
    }`}>
      {!isSent && (
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 shadow-lg"
          style={{ 
            background: isBot 
              ? `linear-gradient(135deg, ${getBotColor()}, ${getBotColor()}dd)` 
              : 'linear-gradient(135deg, #ec4899, #f43f5e)'
          }}
        >
          {message.user.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex flex-col gap-1.5 min-w-0">
        {!isSent && (
          <div 
            className="text-sm font-bold px-1 tracking-wide"
            style={{ color: isBot ? getBotColor() : '#ec4899' }}
          >
            {message.user}
          </div>
        )}
        <div
          className={`px-5 py-3.5 rounded-2xl leading-relaxed text-[15px] shadow-lg ${
            isSent
              ? 'bg-gradient-to-r from-purple-primary to-accent-pink text-white rounded-br-md'
              : isBot
                ? 'bg-dark-elevated text-gray-200 rounded-bl-md border-l-4'
                : 'bg-dark-elevated text-gray-200 rounded-bl-md'
          }`}
          style={isBot && !isSent ? { borderLeftColor: getBotColor() } : {}}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
