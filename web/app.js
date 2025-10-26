(() => {
  let ws = null;
  let currentUser = '';
  let roomId = 'main';

  // Name screen logic
  const nameInput = document.getElementById('name-input');
  const joinBtn = document.getElementById('join-btn');
  const nameScreen = document.getElementById('name-screen');
  const chatScreen = document.getElementById('chat-screen');
  const currentUserBadge = document.getElementById('current-user');

  joinBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    currentUser = name;
    currentUserBadge.textContent = currentUser;
    nameScreen.classList.remove('active');
    chatScreen.classList.add('active');
    connect();
  });

  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinBtn.click();
  });

  // WebSocket connection
  const connect = () => {
    const wsUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws/' + roomId;
    ws = new WebSocket(wsUrl);
    
    ws.addEventListener('open', () => {
      send({type: 'join', user: currentUser});
      appendSystemMessage('Connected to chat');
    });

    ws.addEventListener('message', (ev) => {
      try {
        const obj = JSON.parse(ev.data);
        handleMessage(obj);
      } catch (e) {
        console.error('Invalid message', e);
      }
    });

    ws.addEventListener('close', () => {
      appendSystemMessage('Disconnected from chat');
    });
  };

  const send = (obj) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(obj));
  };

  // Message handling
  const messagesArea = document.getElementById('messages');

  const appendSystemMessage = (text) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message system';
    msgDiv.innerHTML = `<div class="message-bubble">${escapeHtml(text)}</div>`;
    messagesArea.appendChild(msgDiv);
    scrollToBottom();
  };

  const appendChatMessage = (user, content) => {
    const isSent = user === currentUser;
    const isBot = user === 'Bot';
    const isGoodBot = user === 'GoodBot';
    const isEvilBot = user === 'EvilBot';
    
    let className = 'message ';
    if (isSent) {
      className += 'sent';
    } else if (isGoodBot) {
      className += 'good-bot received';
    } else if (isEvilBot) {
      className += 'evil-bot received';
    } else if (isBot) {
      className += 'bot received';
    } else {
      className += 'received';
    }
    
    const msgDiv = document.createElement('div');
    msgDiv.className = className;
    
    const avatar = user.charAt(0).toUpperCase();
    msgDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <div class="message-sender">${escapeHtml(user)}</div>
        <div class="message-bubble">${escapeHtml(content)}</div>
      </div>
    `;
    
    messagesArea.appendChild(msgDiv);
    scrollToBottom();
  };

  const handleMessage = (obj) => {
    if (obj.type === 'chat') {
      appendChatMessage(obj.user, obj.content);
    } else if (obj.type === 'system') {
      const event = obj.event || '';
      if (event === 'debate.start') {
        appendDebateBanner(obj.message || 'Moral Debate Mode Active 🎭');
      } else {
        appendSystemMessage(event || JSON.stringify(obj));
      }
    } else if (obj.type === 'error') {
      appendSystemMessage('Error: ' + obj.message);
    }
  };

  const appendDebateBanner = (text) => {
    const banner = document.createElement('div');
    banner.className = 'message system';
    banner.innerHTML = `<div class="message-bubble" style="background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); color: white; font-weight: 600;">🎭 ${escapeHtml(text)}</div>`;
    messagesArea.appendChild(banner);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesArea.scrollTop = messagesArea.scrollHeight;
  };

  // Input handling
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');

  const sendMessage = () => {
    const content = messageInput.value.trim();
    if (!content) return;
    
    send({type: 'chat', user: currentUser, content});
    messageInput.value = '';
  };

  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Settings panel
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const closeSettings = document.getElementById('close-settings');
  const updatePersonaBtn = document.getElementById('update-persona');

  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('hidden');
    settingsPanel.classList.add('active');
  });

  closeSettings.addEventListener('click', () => {
    settingsPanel.classList.remove('active');
  });

  updatePersonaBtn.addEventListener('click', () => {
    const persona = {
      name: document.getElementById('bot-name').value,
      backstory: document.getElementById('bot-personality').value,
      tone: document.getElementById('bot-tone').value,
      formality: document.getElementById('bot-formality').value,
      emoji_ok: document.getElementById('bot-emoji').checked,
      talkativeness: {
        target_msgs_per_min: 1,
        respond_on_mentions: true,
        proactive_on_lull_sec: 45,
        max_consecutive_ai_msgs: parseInt(document.getElementById('bot-max-consecutive').value) || 1
      },
      addressing: { tag_users_by_name: true, prefer_short_answers: document.getElementById('bot-short-answers').checked },
      safety: { refuse_topics: [], pg_rating: 'PG' },
      structured_output: true
    };
    send({type: 'persona.update', persona});
    settingsPanel.classList.remove('active');
    appendSystemMessage('Bot settings updated');
  });

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();
