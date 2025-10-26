import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BotSelection() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const handleEnterChat = () => {
    if (!userName.trim()) {
      alert('Please enter your name!');
      return;
    }
    navigate('/rooms', { state: { userName } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-purple-950/20 to-dark-bg flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-pink/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-2xl w-full bg-dark-card/80 backdrop-blur-xl border-4 border-purple-primary rounded-3xl p-12 shadow-2xl shadow-purple-primary/20 relative z-10 animate-[slideIn_0.6s_ease-out] retro-bevel retro-grid">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-7xl animate-float">🎭</span>
          </div>
          <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-purple-light via-accent-pink to-accent-cyan bg-clip-text text-transparent mb-4 crt-glow tracking-wider">
            AIRA
          </h1>
          <p className="text-gray-400 text-lg font-body">
            Where multiple AI personalities meet in one conversation
          </p>
        </div>

        {/* Name input section */}
        <div className="mb-10">
          <label 
            htmlFor="userName" 
            className="block text-center text-gray-300 font-semibold mb-4 text-lg"
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
            className="w-full px-6 py-4 bg-dark-elevated border-2 border-dark-border rounded-2xl text-white text-center text-lg placeholder-gray-500 focus:border-purple-primary focus:ring-4 focus:ring-purple-primary/20 outline-none transition-all duration-300"
          />
        </div>

        {/* Enter button */}
        <button
          onClick={handleEnterChat}
          disabled={!userName.trim()}
          className="w-full py-4 px-8 bg-gradient-to-r from-purple-primary to-accent-pink text-white font-bold text-lg rounded-2xl shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          Enter Chat Room →
        </button>

        {/* Info tip */}
        <div className="mt-8 p-4 bg-purple-primary/10 border border-purple-primary/30 rounded-xl">
          <p className="text-center text-gray-300 text-sm">
            <span className="mr-2">💡</span>
            <span className="font-semibold">Tip:</span> Use the + button in chat to add AI personalities!
          </p>
        </div>
      </div>

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
