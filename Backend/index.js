require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const ChatMessage = require('./models/ChatMessage');
const sessionStore = require('./store/sessionStore');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '180000'); // 3 mins default

app.use(cors());
app.use(express.json());

// Mock login route
app.post('/login', (req, res) => {
  const { username, interests } = req.body;
  if (!username || !Array.isArray(interests)) {
    return res.status(400).json({ error: 'username and interests (array) required' });
  }

  // Issue JWT token with username & interests
  const token = jwt.sign({ username, interests }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const user = jwt.verify(token, JWT_SECRET);
    socket.user = user;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

// Store waiting users here before pairing
const waitingUsers = [];

io.on('connection', (socket) => {
  const { username, interests } = socket.user;
  console.log(`User connected: ${username} with interests: ${interests}`);

  // Try to find a session to join based on shared interests
  const matchedSession = sessionStore.findSessionByInterest(interests);

  if (matchedSession) {
    // Join existing session
    const { sessionId, session } = matchedSession;

    if (session.users.length < 2) {
      session.users.push({ socket, username, interests });
      socket.join(sessionId);
      socket.sessionId = sessionId;

      // Reset session expiration timer
      sessionStore.createSession(sessionId, session.users, session.interests, SESSION_TIMEOUT, onSessionExpire);

      // Notify users session started
      io.to(sessionId).emit('session-start', { sessionId, users: session.users.map(u => u.username) });
      console.log(`User ${username} joined existing session ${sessionId}`);
    } else {
      // Session full, add user to waiting queue
      waitingUsers.push({ socket, username, interests });
      socket.emit('waiting', 'No available sessions, added to waiting list');
    }
  } else {
    // Create new session
    const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const users = [{ socket, username, interests }];
    socket.join(sessionId);
    socket.sessionId = sessionId;
    sessionStore.createSession(sessionId, users, interests, SESSION_TIMEOUT, onSessionExpire);

    socket.emit('waiting', 'Waiting for partner to join');
    waitingUsers.push({ socket, username, interests });

    console.log(`Created new session ${sessionId} for user ${username}`);
  }

  // When a user sends a chat message
  socket.on('chat-message', async (msg) => {
    const sessionId = socket.sessionId;
    if (!sessionId) return;

    const chatMsg = new ChatMessage({
      sessionId,
      sender: username,
      message: msg,
      timestamp: new Date()
    });

    await chatMsg.save();

    // Broadcast to room
    io.to(sessionId).emit('chat-message', {
      sender: username,
      message: msg,
      timestamp: chatMsg.timestamp
    });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${username}`);
    const sessionId = socket.sessionId;
    if (sessionId) {
      const session = sessionStore.getSession(sessionId);
      if (session) {
        session.users = session.users.filter(u => u.socket.id !== socket.id);

        if (session.users.length === 0) {
          sessionStore.deleteSession(sessionId);
          console.log(`Session ${sessionId} deleted (empty)`);
        } else {
          // Notify remaining user
          io.to(sessionId).emit('partner-left');
        }
      }
    }

    // Remove from waiting users if present
    const idx = waitingUsers.findIndex(u => u.socket.id === socket.id);
    if (idx !== -1) waitingUsers.splice(idx, 1);
  });
});

function onSessionExpire(sessionId) {
  console.log(`Session expired: ${sessionId}`);
  const session = sessionStore.getSession(sessionId);
  if (session) {
    session.users.forEach(u => {
      u.socket.emit('session-expired');
      u.socket.leave(sessionId);
      u.socket.sessionId = null;
    });
    sessionStore.deleteSession(sessionId);
  }
}

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
