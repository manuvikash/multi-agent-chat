import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BotSelection from './pages/BotSelection';
import RoomSelection from './pages/RoomSelection';
import ChatRoom from './pages/ChatRoom';
import './App.css';

export default function App() {
  return (
    <div className="relative">
      {/* CRT Effects Overlay */}
      <div className="crt-scanlines"></div>
      <div className="crt-screen"></div>
      <div className="crt-vignette"></div>
      <div className="crt-noise"></div>
      
      {/* Main App Content */}
      <div className="crt-flicker">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<BotSelection />} />
            <Route path="/rooms" element={<RoomSelection />} />
            <Route path="/chat" element={<ChatRoom />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}
