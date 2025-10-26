import { useState, useEffect } from 'react';
import { X, Check, Plus, Skull } from 'lucide-react';
import { cn } from '../lib/utils';

const BOT_INFO = {
  'gooner': { emoji: '😎', name: 'Gooner', tagline: 'The chillest stoic chad', color: '#667eea' },
  'professor': { emoji: '🎓', name: 'Professor Syntax', tagline: 'Victorian scholar from 1847', color: '#8e44ad' },
  'glitchcore': { emoji: '⚡', name: 'Glitchcore', tagline: 'Corrupted AI speaking l33t', color: '#e74c3c' },
  'mama': { emoji: '🧸', name: 'Mama Bear', tagline: 'Wholesome grandma energy', color: '#f39c12' },
  'edgelord': { emoji: '🖤', name: 'EdgeLord Supreme', tagline: '2000s MySpace emo vibes', color: '#9b59b6' },
  'corporate': { emoji: '💼', name: 'Corporate Speak 3000', tagline: 'Pure business jargon', color: '#3498db' },
  'goblin': { emoji: '👹', name: 'Chaos Goblin', tagline: 'Mischievous trickster agent', color: '#e67e22' },
  'zen': { emoji: '🧘', name: 'Zen Master Byte', tagline: 'Enlightened AI koans', color: '#1abc9c' }
};

export default function BotSelector({ activeBots, onAddBot, onRemoveBot, onClose }) {
  const [bots, setBots] = useState([]);

  useEffect(() => {
    setBots(Object.entries(BOT_INFO).map(([id, info]) => ({ id, ...info })));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-4xl bg-card border border-border rounded-xl",
          "shadow-2xl card-glow overflow-hidden"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/50">
          <div className="flex items-center gap-3">
            <Skull className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">AI Personalities</h3>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-full hover:bg-secondary",
              "text-muted-foreground hover:text-foreground",
              "transition-all duration-200"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 max-h-[70vh] overflow-y-auto">
          {bots.map(bot => {
            const isActive = activeBots.includes(bot.id);
            return (
              <div
                key={bot.id}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-200",
                  "bg-secondary/30 hover:bg-secondary/50",
                  isActive && "ring-2 ring-offset-2 ring-offset-background"
                )}
                style={{
                  borderColor: bot.color,
                  ...(isActive && { ringColor: bot.color })
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{bot.emoji}</span>
                  <div className="flex-1">
                    <h4
                      className="font-bold text-lg leading-tight"
                      style={{ color: bot.color }}
                    >
                      {bot.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bot.tagline}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => isActive ? onRemoveBot(bot.id) : onAddBot(bot.id)}
                  className={cn(
                    "w-full px-4 py-2 rounded-md font-medium text-sm",
                    "transition-all duration-200 flex items-center justify-center gap-2",
                    isActive
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : "text-white hover:opacity-90"
                  )}
                  style={{
                    backgroundColor: isActive ? undefined : bot.color
                  }}
                >
                  {isActive ? (
                    <>
                      <Check className="w-4 h-4" />
                      Active
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
