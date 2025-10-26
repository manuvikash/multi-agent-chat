import { useState, useEffect } from 'react';
import './BotSelector.css';

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
    // Convert local bot info to array
    setBots(Object.entries(BOT_INFO).map(([id, info]) => ({ id, ...info })));
  }, []);

  return (
    <div className="bot-selector-overlay" onClick={onClose}>
      <div className="bot-selector-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>🎭 AI Personalities</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="bot-grid">
          {bots.map(bot => {
            const isActive = activeBots.includes(bot.id);
            return (
              <div
                key={bot.id}
                className={`bot-card ${isActive ? 'active' : ''}`}
                style={{ borderColor: bot.color }}
              >
                <div className="bot-card-header">
                  <span className="bot-emoji">{bot.emoji}</span>
                  <h4 style={{ color: bot.color }}>{bot.name}</h4>
                </div>
                <p className="bot-tagline">{bot.tagline}</p>
                <button
                  className={`toggle-bot-btn ${isActive ? 'remove' : 'add'}`}
                  onClick={() => isActive ? onRemoveBot(bot.id) : onAddBot(bot.id)}
                  style={{
                    backgroundColor: isActive ? '#e74c3c' : bot.color
                  }}
                >
                  {isActive ? '✓ Active' : '+ Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
