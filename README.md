# YouTube Watch Party System

A real-time, synchronized YouTube watch party application that allows multiple users to watch videos together. When the host pauses, seeks, or changes the video, everyone in the room sees the same action perfectly synced.

## Features

- **Real-Time Synchronization**: Watch YouTube videos in perfect sync with your friends.
- **Room-Based Playback**: Create or join unique watch rooms.
- **Role-Based Access Control**:
  - **Host**: Full control over playback, video selection, and room management.
  - **Moderator**: Has playback control and can remove participants.
  - **Participant**: Can only watch the video and chat (view-only mode).
- **Sleek UI**: A modern, glassmorphic design built with React and Tailwind CSS v4.
- **Google OAuth**: Sign in with your Google account.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Backend**: Node.js, Express 5, Socket.io
- **Real-Time Communication**: Socket.io (WebSockets)
- **Video Player**: YouTube IFrame API (`react-youtube`)
- **Auth**: Google OAuth 2.0 (`@react-oauth/google`)

## Getting Started (Local Development)

### Prerequisites

Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sanjana2505006/web3task.git
   cd web3task/watch-party
   ```

2. **Backend Setup** — open a terminal in the `server` directory:
   ```bash
   cd server
   npm install
   cp .env.example .env   # edit .env with your values
   npm start
   ```
   Server runs on `http://localhost:3001`.

3. **Frontend Setup** — open another terminal in the `client` directory:
   ```bash
   cd client
   npm install
   cp .env.example .env   # add your VITE_GOOGLE_CLIENT_ID
   npm run dev
   ```
   Client runs on `http://localhost:5173`.

### Usage

1. Open `http://localhost:5173` in your browser.
2. Enter your username and create a new room — you become the **Host** automatically.
3. Share the Room Code with friends.
4. Friends join by entering their username and the Room Code as **Participants**.
5. As the Host, control playback or manage roles from the Participants list.

---

## Deployment

This project is split into two deployable parts: the frontend (static) and the backend (WebSocket server). They **must be hosted separately** because Vercel serverless functions do not support persistent WebSocket connections.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and import this repository.
2. Set **Root Directory** to `watch-party/client` in the project settings.
3. Add the following **Environment Variables** in the Vercel dashboard:

   | Variable | Value |
   |---|---|
   | `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
   | `VITE_SOCKET_URL` | Your deployed backend URL (e.g. `https://watch-party-server.onrender.com`) |

4. Deploy. Vercel picks up the `vercel.json` inside `watch-party/client/` automatically.

### Backend → Render

1. Go to [render.com](https://render.com) and create a new **Web Service**.
2. Connect this repository. Render will detect `render.yaml` at the repo root and configure the service automatically.
3. After the first deploy, set the `CLIENT_URL` environment variable to your Vercel frontend URL (e.g. `https://watch-party.vercel.app`).

> **Note**: On Render's free tier the server spins down after inactivity. The first connection after a period of inactivity may take ~30 seconds. Upgrade to a paid plan to keep it always-on.

### Environment Variables Reference

**Frontend (`watch-party/client/.env`)**
```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_SOCKET_URL=https://watch-party-server.onrender.com
```

**Backend (`watch-party/server/.env`)**
```env
PORT=3001
CLIENT_URL=https://watch-party.vercel.app
```

---

## Demo Screenshots

<img width="1512" height="902" alt="Screenshot 2026-03-05 at 4 35 53 PM" src="https://github.com/user-attachments/assets/501c97c0-4513-4510-b02b-2c4f0ce8a377" />


<img width="1512" height="913" alt="Screenshot 2026-03-05 at 4 36 31 PM" src="https://github.com/user-attachments/assets/6565ce7c-baae-44e6-810d-ea0cf5f288af" />


<img width="1512" height="908" alt="Screenshot 2026-03-05 at 4 34 05 PM" src="https://github.com/user-attachments/assets/15581f37-00bb-41f9-bce3-9de242510f82" />


## License

This project is open-source and available under the MIT License ❤️.
