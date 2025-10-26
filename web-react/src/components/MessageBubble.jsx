import { cn } from '../lib/utils';

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

  const getBotColor = () => {
    return BOT_COLORS[message.user] || '#667eea';
  };

  if (isSystem) {
    const isDebate = message.content.includes('Debate') || message.content.includes('debate');
    return (
      <div className="flex justify-center my-4">
        <div className={cn(
          "px-4 py-2 rounded-full text-sm font-medium",
          "bg-secondary/50 border border-border",
          "text-muted-foreground",
          isDebate && "border-primary/50 text-primary"
        )}>
          {isDebate && '🎭 '}
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex gap-3 max-w-4xl",
      isSent ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {!isSent && (
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "font-bold text-white text-sm flex-shrink-0",
            "shadow-lg"
          )}
          style={{ backgroundColor: isBot ? getBotColor() : '#667eea' }}
        >
          {message.user.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={cn(
        "flex flex-col gap-1",
        isSent ? "items-end" : "items-start"
      )}>
        {!isSent && (
          <span
            className="text-sm font-semibold px-2"
            style={{ color: isBot ? getBotColor() : '#667eea' }}
          >
            {message.user}
          </span>
        )}
        <div
          className={cn(
            "px-4 py-3 rounded-lg max-w-2xl",
            "shadow-md transition-all duration-200",
            isSent
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border border-border rounded-bl-sm",
            isBot && "border-l-4"
          )}
          style={isBot ? { borderLeftColor: getBotColor() } : {}}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
