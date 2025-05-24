# Real-time-video-enabled-networkingSystem
real-time video-enabled networking system
- Backend and frontend communication structure
- Live debugging and validation strategies
- Real-time session management and matching logic
# Speed Connect Demo
## 📁 Folder Structure

```plaintext
speed-connect-demo/
│
├── backend/
│   ├── .env
│   ├── index.js
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── ChatMessage.js
│   ├── store/
│   │   └── sessionStore.js
│   └── node_modules/           # created by `npm install`
│
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   └── App.js
│   └── node_modules/           # created by `npm install`
│
└── README.md

## 🛠️ Setup Instructions

### 🔧 Backend

1. Navigate to backend:
 - cd backend
- Install dependencie:
- npm install
- Create a .env file:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

* Start backend server:
npm start
➤ Server runs at: http://localhost:4000

🎨 Frontend
Navigate to frontent: 
cd frontend
Install dependencies:
npm install
Start React app:
npm start
➤ Opens in browser: http://localhost:3000

🧪 Features
✅ Mocked JWT login

✅ WebSocket-based interest matching

✅ Real-time chat via Socket.io

✅ Countdown timer for active sessions

✅ MongoDB chat log persistence

✅ In-memory Redis-style session store

✅ Automatic cleanup of expired/inactive sessions

📌 Usage:
----------
Log in with a username and comma-separated interests (e.g. art,tech,sports)
You’ll be matched with someone who shares at least one interest
Chat in real-time with your match
A countdown timer tracks the remaining session time
When the session ends, users can leave or wait to be re-matched
