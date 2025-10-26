import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BotSelection.css';

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
    <div className="bot-selection">
      <div className="selection-container">
        <div className="header">
          <h1 className="title">🎭 AI Multiverse Chat</h1>
          <p className="subtitle">Where multiple AI personalities meet in one conversation</p>
        </div>

        <div className="name-section">
          <label htmlFor="userName">What's your name?</label>
          <input
            id="userName"
            type="text"
            placeholder="Enter your name..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEnterChat()}
            maxLength={20}
            autoFocus
          />
        </div>

        <button
          className="enter-btn"
          onClick={handleEnterChat}
          disabled={!userName.trim()}
        >
          Enter Chat Room →
        </button>

        <div className="info-box">
          <p>💡 <strong>Tip:</strong> Use the + button in chat to add AI personalities!</p>
        </div>
      </div>
    </div>
  );
}
