# Real-time-video-enabled-networkingSystem
real-time video-enabled networking system
# Speed Connect Demo

This is a minimal real-time video-enabled networking system built with:

- **Backend:** Node.js + Express + Socket.io
- **Frontend:** React
- **Persistence:** Mocked Redis-like in-memory store, MongoDB for chat logs
- **Authentication:** Mocked JWT-based login
- **Real-time:** WebSocket user pairing by interests (tags), chat with countdown timer

---

## Folder Structure

speed-connect-demo/
│
├── backend/
│ ├── .env # Environment variables for backend (Mongo URI etc.)
│ ├── package.json # Backend dependencies and scripts
│ ├── index.js # Backend main server and Socket.io logic
│ ├── middleware/
│ │ └── auth.js # JWT verification middleware
│ ├── models/
│ │ └── ChatMessage.js # MongoDB model for chat messages
│ ├── store/
│ │ └── sessionStore.js # In-memory session store mock Redis
│ └── node_modules/ # Installed backend packages (after npm install)
│
├── frontend/
│ ├── package.json # Frontend dependencies and scripts
│ ├── public/
│ │ └── index.html # HTML entry point
│ ├── src/
│ │ ├── index.js # React app bootstrap
│ │ └── App.js # Main React component with UI and WebSocket logic
│ └── node_modules/ # Installed frontend packages (after npm install)
│
└── README.md # This file

yaml
Copy
Edit

---

## Setup Instructions

### Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
Install dependencies:

bash
Copy
Edit
npm install
Create a .env file in the backend folder with:

ini
Copy
Edit
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
Start the backend server:

bash
Copy
Edit
npm start
Server listens on http://localhost:4000

Frontend
Navigate to the frontend folder:

bash
Copy
Edit
cd frontend
Install dependencies:

bash
Copy
Edit
npm install
Start the React development server:

bash
Copy
Edit
npm start
Frontend opens in browser at http://localhost:3000 and connects to backend on port 4000.

Usage
Login by entering a username and comma-separated interests.

The system pairs you in a session with another user who shares interests.

Chat with the matched partner via live messages.

Countdown timer shows session time left.

Sessions expire after timeout or partner disconnects.

Notes
This is a demo/prototype focusing on core real-time functionality.

Redis is mocked via an in-memory store; MongoDB is required for chat persistence.

Authentication is simplified with mocked JWT tokens.

UI is minimal and functional, not styled for production.


# 🚀 Speed Connect Demo

A minimal real-time networking app for interest-based pairing and live chat.

## 📦 Tech Stack

**Backend:**
- Node.js
- Express.js
- Socket.io
- MongoDB (for chat persistence)
- In-memory mock of Redis (for session storage)
- JWT (mocked)

**Frontend:**
- React
- WebSocket connection to backend
- Minimal, functional UI with live text chat and countdown timer

---

## 📁 Folder Structure

