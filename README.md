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

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Backend**: Node.js, Express.js
- **Real-Time Communication**: Socket.io
- **Video Player**: YouTube IFrame API (`react-youtube`)

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sanjana2505006/web3task.git
   cd web3task/watch-party
   ```

2. **Backend Setup**:
   Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   npm install
   npm start
   ```
   The server will start running on `http://localhost:3001`.

3. **Frontend Setup**:
   Open a new terminal window and navigate to the `client` directory:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The client will be running on `http://localhost:5173`.

### Usage

1. Open your browser and go to `http://localhost:5173`.
2. Enter your username and create a new room. You will automatically become the **Host**.
3. Share the Room Code with your friends.
4. They can join by entering their username and the Room Code. They will join as **Participants**.
5. As the Host, you can control the video or change roles from the Participants list.

## License

This project is open-source and available under the MIT License.
Made with ❤️
