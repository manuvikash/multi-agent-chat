import { useState, useEffect } from 'react';

const BOT_INFO = {
  'gooner': { emoji: '👊', name: 'Saitama', tagline: 'One Punch Hero - OK. Whatever.', color: '#8b5cf6' },
  'professor': { emoji: '📓', name: 'Light Yagami', tagline: 'God of the New World - All according to keikaku', color: '#a78bfa' },
  'glitchcore': { emoji: '⚡', name: 'Accelerator', tagline: "Academy City's #1 - Vector manipulation", color: '#ec4899' },
  'mama': { emoji: '🎋', name: 'Nezuko', tagline: "Demon Slayer's Sister - Mmmph! *protects*", color: '#f59e0b' },
  'edgelord': { emoji: '⚔️', name: 'Sasuke Uchiha', tagline: "Last Uchiha - Tch. Avenger's path", color: '#9333ea' },
  'corporate': { emoji: '💼', name: 'Reigen Arataka', tagline: 'Greatest Psychic - 1000% business mode', color: '#06b6d4' },
  'goblin': { emoji: '🥋', name: 'Goku', tagline: "Saiyan Warrior - Let's fight!", color: '#f97316' },
  'zen': { emoji: '👼', name: 'Whis', tagline: 'Angel Attendant - Divine wisdom', color: '#10b981' }
};

export default function BotSelector({ activeBots, onAddBot, onRemoveBot, onClose }) {
  const [bots, setBots] = useState([]);

  useEffect(() => {
    // Convert local bot info to array
    setBots(Object.entries(BOT_INFO).map(([id, info]) => ({ id, ...info })));
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
    >
      <div 
        className="bg-dark-card border border-dark-border rounded-3xl p-8 max-w-4xl w-[90%] max-h-[85vh] overflow-y-auto shadow-2xl shadow-purple-primary/30 animate-[slideUp_0.3s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-dark-border">
          <h3 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            🎭 <span className="bg-gradient-to-r from-purple-light to-accent-cyan bg-clip-text text-transparent">
              AI Personalities
            </span>
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-3xl flex items-center justify-center transition-all duration-200 hover:rotate-90"
          >
            ×
          </button>
        </div>
        
        {/* Bot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bots.map(bot => {
            const isActive = activeBots.includes(bot.id);
            return (
              <div
                key={bot.id}
                className={`bg-dark-elevated/50 backdrop-blur-sm border-2 rounded-2xl p-5 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
                  isActive ? 'bg-dark-elevated shadow-lg' : ''
                }`}
                style={{ 
                  borderColor: bot.color,
                  boxShadow: isActive ? `0 0 20px ${bot.color}30` : undefined
                }}
              >
                {/* Character Image */}
                <div className="mb-4 flex justify-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-dark-border" style={{ borderColor: bot.color }}>
                    <img
                      src={`/personas/${bot.id}.png`}
                      alt={bot.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to jpg if png doesn't exist
                        if (e.target.src.endsWith('.png')) {
                          e.target.src = `/personas/${bot.id}.jpg`;
                        } else {
                          // If both fail, show emoji fallback
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center bg-dark-elevated text-5xl">
                      {bot.emoji}
                    </div>
                  </div>
                </div>

                <div className="text-center mb-3">
                  <h4 
                    className="text-xl font-bold"
                    style={{ color: bot.color }}
                  >
                    {bot.name}
                  </h4>
                </div>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed min-h-[40px] text-center">
                  {bot.tagline}
                </p>
                <button
                  onClick={() => isActive ? onRemoveBot(bot.id) : onAddBot(bot.id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-105 shadow-lg ${
                    isActive ? 'bg-red-500 hover:bg-red-600' : ''
                  }`}
                  style={!isActive ? { 
                    background: `linear-gradient(135deg, ${bot.color}, ${bot.color}dd)`,
                  } : {}}
                >
                  {isActive ? '✓ Active' : '+ Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
