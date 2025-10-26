import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skull, ArrowRight, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BotSelection() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const handleEnterChat = () => {
    if (!userName.trim()) {
      alert('Please enter your name!');
      return;
    }
    navigate('/chat', { state: { userName } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Skull className="w-20 h-20 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-glow bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            AI Multiverse
          </h1>
          <p className="text-muted-foreground text-lg">
            Where multiple AI personalities meet in one conversation
          </p>
        </div>

        <div className={cn(
          "bg-card border border-border rounded-lg p-8 space-y-6",
          "shadow-2xl card-glow backdrop-blur-sm"
        )}>
          <div className="space-y-3">
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-foreground/90"
            >
              What's your name?
            </label>
            <input
              id="userName"
              type="text"
              placeholder="Enter your name..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEnterChat()}
              maxLength={20}
              autoFocus
              className={cn(
                "w-full px-4 py-3 rounded-md",
                "bg-secondary border border-border",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "transition-all duration-200"
              )}
            />
          </div>

          <button
            onClick={handleEnterChat}
            disabled={!userName.trim()}
            className={cn(
              "w-full px-6 py-3 rounded-md font-medium",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary",
              "transition-all duration-200",
              "flex items-center justify-center gap-2",
              "border-glow"
            )}
          >
            Enter Chat Room
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className={cn(
            "flex items-start gap-3 p-4 rounded-md",
            "bg-secondary/50 border border-border/50"
          )}>
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Tip:</span> Use the + button in chat to add AI personalities!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
