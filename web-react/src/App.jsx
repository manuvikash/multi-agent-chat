import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BotSelection from './pages/BotSelection';
import ChatRoom from './pages/ChatRoom';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BotSelection />} />
        <Route path="/chat" element={<ChatRoom />} />
      </Routes>
    </BrowserRouter>
  );
}
