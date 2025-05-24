import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:4000';

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [interests, setInterests] = useState('');
  const [socket, setSocket] = useState(null);

  const [connectedUsers, setConnectedUsers] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  // Login - mocked JWT
  const login = async () => {
    if (!username || !interests) {
      alert('Enter username and comma separated interests');
      return;
    }

    const res = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, interests: interests.split(',').map(i => i.trim()) })
    });

    const data = await res.json();
    if (data.token) {
      setToken(data.token);
    } else {
      alert('Login failed');
    }
  };

  // Setup socket after token available
  useEffect(() => {
    if (!token) return;

    const s = io(BACKEND_URL, {
      auth: { token }
    });

    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to socket.io');
    });

    s.on('waiting', (msg) => {
      console.log('Waiting:', msg);
      setSessionId(null);
      setConnectedUsers([]);
      setChatLog([]);
      setTimeLeft(null);
    });

    s.on('session-start', ({ sessionId, users }) => {
      setSessionId(sessionId);
      setConnectedUsers(users);
      setChatLog([]);
      startCountdown(180); // 3 min countdown
    });

    s.on('chat-message', (msg) => {
      setChatLog((prev) => [...prev, msg]);
    });

    s.on('partner-left', () => {
      alert('Your partner left the chat.');
      setSessionId(null);
      setConnectedUsers([]);
      setChatLog([]);
      setTimeLeft(null);
      clearCountdown();
    });

    s.on('session-expired', () => {
      alert('Session expired due to inactivity.');
      setSessionId(null);
      setConnectedUsers([]);
      setChatLog([]);
      setTimeLeft(null);
      clearCountdown();
    });

    s.on('disconnect', () => {
      console.log('Disconnected from socket.io');
      setSessionId(null);
      setConnectedUsers([]);
      setChatLog([]);
      setTimeLeft(null);
      clearCountdown();
    });

    return () => {
      s.disconnect();
      clearCountdown();
    };
  }, [token]);

  const sendMessage = () => {
    if (!message || !socket) return;
    socket.emit('chat-message', message);
    setMessage('');
  };

  // Countdown timer (seconds)
  const startCountdown = (seconds) => {
    clearCountdown();
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1) {
          clearCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      {!token ? (
        <div>
          <h2>Login</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <input
            placeholder="Interests (comma separated)"
            value={interests}
            onChange={e => setInterests(e.target.value)}
            style={{ marginRight: 10, width: 250 }}
          />
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div>
          <h3>Connected Users: {connectedUsers.join(', ')}</h3>
          {sessionId ? (
            <>
              <div>Session ID: {sessionId}</div>
              <div>Time Left: {timeLeft ? `${timeLeft} sec` : 'N/A'}</div>

              <div
                style={{
                  border: '1px solid #ccc',
                  height: 300,
                  width: 400,
                  overflowY: 'scroll',
                  padding: 5,
                  marginBottom: 10,
                }}
              >
                {chatLog.map((msg, i) => (
                  <div key={i}>
                    <strong>{msg.sender}:</strong> {msg.message}{' '}
                    <small style={{ color: '#888' }}>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                  </div>
                ))}
              </div>

              <input
                type="text"
                placeholder="Type message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ width: 320, marginRight: 10 }}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </>
          ) : (
            <div>Waiting for a partner to join...</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
