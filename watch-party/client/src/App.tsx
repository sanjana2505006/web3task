import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import LandingView from './components/LandingView';
import RoomView from './components/RoomView';

// Replace with dynamic URL if needed
const SOCKET_URL = 'http://localhost:3001';

export type UserRole = 'Host' | 'Moderator' | 'Participant';

export interface Participant {
  userId: string;
  username: string;
  role: UserRole;
}

export interface RoomState {
  videoId: string;
  playState: 'playing' | 'paused';
  currentTime: number;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const [roomState, setRoomState] = useState<RoomState>({
    videoId: 'dQw4w9WgXcQ',
    playState: 'paused',
    currentTime: 0
  });
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    // Check if user has explicit preference, otherwise use dark by default 
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // the sleek UI we built defaults to dark
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Connect to socket when joining
  const handleJoin = (roomId: string, username: string) => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    setRoomId(roomId);
    setUsername(username);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', { roomId, username });
      setInRoom(true);
    });

    setupSocketListeners(newSocket);
  };

  const setupSocketListeners = (s: Socket) => {
    s.on('sync_state', (state: RoomState) => {
      setRoomState(state);
    });

    s.on('room_users', (users: Participant[]) => {
      setParticipants(users);
    });

    s.on('play', () => setRoomState(prev => ({ ...prev, playState: 'playing' })));
    s.on('pause', () => setRoomState(prev => ({ ...prev, playState: 'paused' })));
    s.on('seek', (time: number) => setRoomState(prev => ({ ...prev, currentTime: time })));
    s.on('change_video', (videoId: string) => setRoomState(prev => ({ ...prev, videoId, playState: 'paused', currentTime: 0 })));

    s.on('role_assigned', ({ participants }) => setParticipants(participants));
    s.on('participant_removed', ({ participants }) => setParticipants(participants));

    s.on('kicked', () => {
      alert("You have been removed from the room.");
      handleLeave();
    });
  };

  const handleLeave = () => {
    if (socket) {
      socket.emit('leave_room', { roomId });
      socket.disconnect();
    }
    setSocket(null);
    setInRoom(false);
    setParticipants([]);
  };

  const currentUserRole = participants.find(p => p.userId === socket?.id)?.role || 'Participant';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0D14] transition-colors duration-300">
      {!inRoom ? (
        <LandingView onJoin={handleJoin} theme={theme} toggleTheme={toggleTheme} />
      ) : (
        <RoomView
          socket={socket!}
          roomId={roomId}
          username={username}
          participants={participants}
          roomState={roomState}
          currentUserRole={currentUserRole}
          onLeave={handleLeave}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;
