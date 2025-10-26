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

export default function CreateRoomModal({ onClose, onCreateRoom }) {
  const [roomName, setRoomName] = useState('');
  const [selectedBot, setSelectedBot] = useState('');
  const [bots, setBots] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Convert local bot info to array
    setBots(Object.entries(BOT_INFO).map(([id, info]) => ({ id, ...info })));
  }, []);

  const handleCreate = async () => {
    console.log('[CreateRoomModal] handleCreate called', { roomName, selectedBot });
    
    if (!roomName.trim()) {
      console.log('[CreateRoomModal] Validation failed: no room name');
      setError('Please enter a room name');
      return;
    }
    if (!selectedBot) {
      console.log('[CreateRoomModal] Validation failed: no bot selected');
      setError('Please select a starting bot');
      return;
    }

    console.log('[CreateRoomModal] Starting room creation...');
    setIsCreating(true);
    setError('');

    try {
      console.log('[CreateRoomModal] Calling onCreateRoom...');
      await onCreateRoom(roomName.trim(), selectedBot);
      console.log('[CreateRoomModal] Room created successfully');
    } catch (err) {
      console.error('[CreateRoomModal] Error creating room:', err);
      setError(err.message || 'Failed to create room');
      setIsCreating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
    >
      <div 
        className="bg-dark-card border border-dark-border rounded-3xl p-8 max-w-3xl w-[90%] max-h-[85vh] overflow-y-auto shadow-2xl shadow-purple-primary/30 animate-[slideUp_0.3s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-dark-border">
          <h3 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            🚪 <span className="bg-gradient-to-r from-purple-light to-accent-cyan bg-clip-text text-transparent">
              Create New Room
            </span>
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-3xl flex items-center justify-center transition-all duration-200 hover:rotate-90"
            disabled={isCreating}
          >
            ×
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Room Name Input */}
        <div className="mb-6">
          <label className="block text-gray-300 font-semibold mb-3 text-lg">
            Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter a room name..."
            maxLength={50}
            disabled={isCreating}
            className="w-full px-5 py-3 bg-dark-elevated border-2 border-dark-border rounded-xl text-white placeholder-gray-500 focus:border-purple-primary focus:ring-4 focus:ring-purple-primary/20 outline-none transition-all duration-300 disabled:opacity-60"
            autoFocus
          />
          <div className="mt-1 text-xs text-gray-500">
            {roomName.length}/50 characters
          </div>
        </div>

        {/* Bot Selection */}
        <div className="mb-6">
          <label className="block text-gray-300 font-semibold mb-3 text-lg">
            Choose Your Starting AI Personality
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map(bot => {
              const isSelected = selectedBot === bot.id;
              return (
                <div
                  key={bot.id}
                  onClick={() => !isCreating && setSelectedBot(bot.id)}
                  className={`bg-dark-elevated/50 backdrop-blur-sm border-2 rounded-xl p-4 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
                    isSelected ? 'bg-dark-elevated shadow-lg ring-4 ring-purple-primary/30' : ''
                  } ${isCreating ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={{ 
                    borderColor: isSelected ? bot.color : '#2a2a3e',
                    boxShadow: isSelected ? `0 0 20px ${bot.color}30` : undefined
                  }}
                >
                  {/* Character Image */}
                  <div className="mb-3 flex justify-center">
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

                  <div className="flex items-center gap-2 mb-2">
                    <h4 
                      className="text-lg font-bold text-center w-full"
                      style={{ color: bot.color }}
                    >
                      {bot.name}
                    </h4>
                    {isSelected && (
                      <span className="absolute top-2 right-2 text-purple-primary text-2xl bg-dark-bg rounded-full w-8 h-8 flex items-center justify-center">✓</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed text-center">
                    {bot.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-6 py-3 bg-dark-elevated border-2 border-dark-border text-white rounded-xl font-semibold hover:bg-dark-border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!roomName.trim() || !selectedBot || isCreating}
            className="px-6 py-3 bg-gradient-to-r from-purple-primary to-accent-pink text-white rounded-xl font-semibold shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </button>
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

