import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CreateRoomModal from '../components/CreateRoomModal';

const BOT_EMOJIS = {
  'gooner': '👊',
  'professor': '📓',
  'glitchcore': '⚡',
  'mama': '🎋',
  'edgelord': '⚔️',
  'corporate': '💼',
  'goblin': '🥋',
  'zen': '👼'
};

export default function RoomSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userName } = location.state || {};

  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if no user data
  useEffect(() => {
    if (!userName) {
      navigate('/');
    }
  }, [userName, navigate]);

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (roomName, botId) => {
    console.log('[RoomSelection] handleCreateRoom called', { roomName, botId, userName });
    
    try {
      console.log('[RoomSelection] Making fetch request...');
      const response = await fetch('http://localhost:8000/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          admin: userName,
          initial_bot: botId
        })
      });

      console.log('[RoomSelection] Response received:', response.status, response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[RoomSelection] Response not OK:', errorText);
        throw new Error('Failed to create room');
      }

      const data = await response.json();
      console.log('[RoomSelection] Room created:', data);
      
      // Navigate to chat room
      console.log('[RoomSelection] Navigating to chat...');
      navigate('/chat', {
        state: {
          userName,
          roomId: data.room_id,
          roomName: data.name,
          isAdmin: true
        }
      });
      console.log('[RoomSelection] Navigation complete');
    } catch (error) {
      console.error('[RoomSelection] Error creating room:', error);
      throw error;
    }
  };

  const handleJoinRoom = (room) => {
    navigate('/chat', {
      state: {
        userName,
        roomId: room.room_id,
        roomName: room.name,
        isAdmin: userName === room.admin
      }
    });
  };

  if (!userName) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-purple-950/20 to-dark-bg p-8 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-pink/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-[slideIn_0.6s_ease-out]">
          <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-purple-light via-accent-pink to-accent-cyan bg-clip-text text-transparent mb-4 crt-glow tracking-wider">
            Welcome, {userName}! 👋
          </h1>
          <p className="text-gray-400 text-lg">
            Create a new room or join an existing conversation
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create New Room Section */}
          <div className="bg-dark-card/80 backdrop-blur-xl border-4 border-purple-primary rounded-3xl p-8 shadow-2xl shadow-purple-primary/20 animate-[slideIn_0.6s_ease-out] retro-bevel retro-grid">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-float">🚪</div>
              <h2 className="text-3xl font-display font-bold text-white mb-3">
                Create New Room
              </h2>
              <p className="text-gray-400 mb-6">
                Start a fresh conversation with an AI personality of your choice
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full py-4 px-8 bg-gradient-to-r from-purple-primary to-accent-pink text-white font-bold text-lg rounded-2xl shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] transition-all duration-300"
              >
                Create New Room ✨
              </button>
            </div>
          </div>

          {/* Join Existing Room Section */}
          <div className="bg-dark-card/80 backdrop-blur-xl border-4 border-accent-cyan rounded-3xl p-8 shadow-2xl shadow-purple-primary/20 animate-[slideIn_0.6s_ease-out] retro-bevel retro-grid" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-display font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-4xl">💬</span>
              Available Rooms
            </h2>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-primary"></div>
                  <p className="mt-4">Loading rooms...</p>
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-5xl mb-4">🔍</div>
                  <p>No rooms yet. Create the first one!</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room.room_id}
                    className="bg-dark-elevated border-2 border-dark-border rounded-2xl p-5 hover:border-purple-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {room.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Created by <span className="text-purple-light font-semibold">{room.admin}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleJoinRoom(room)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-primary to-accent-pink text-white font-semibold rounded-xl hover:scale-105 transition-all duration-200 shadow-glow"
                      >
                        Join →
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <span>👥</span>
                        <span>{room.participant_count} {room.participant_count === 1 ? 'user' : 'users'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🤖</span>
                        <div className="flex gap-1">
                          {room.active_bots.map(botId => (
                            <span key={botId} title={botId}>
                              {BOT_EMOJIS[botId] || '🤖'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {rooms.length > 0 && (
              <button
                onClick={fetchRooms}
                className="mt-4 w-full py-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                🔄 Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreateRoom={handleCreateRoom}
        />
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

