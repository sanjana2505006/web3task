import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { LogOut, Link as LinkIcon, PlaySquare } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import ParticipantList from './ParticipantList';
import Chat from './Chat';
import type { RoomState, Participant, UserRole } from '../App';

interface RoomViewProps {
    socket: Socket;
    roomId: string;
    username: string;
    participants: Participant[];
    roomState: RoomState;
    currentUserRole: UserRole;
    onLeave: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const RoomView: React.FC<RoomViewProps> = ({
    socket, roomId, username, participants, roomState, currentUserRole, onLeave, theme, toggleTheme
}) => {
    const [videoUrl, setVideoUrl] = useState('');

    const hasPermission = currentUserRole === 'Host' || currentUserRole === 'Moderator';
    const currentUserId = socket.id || '';

    const extractVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleChangeVideo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasPermission) return;

        const vId = extractVideoId(videoUrl);
        if (vId) {
            socket.emit('change_video', vId);
            setVideoUrl('');
        } else {
            // Just try as an ID
            if (videoUrl.length === 11) {
                socket.emit('change_video', videoUrl);
                setVideoUrl('');
            } else {
                alert('Invalid YouTube URL or ID');
            }
        }
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomId);
        alert('Room code copied to clipboard!');
    };

    return (
        <div className="flex flex-col h-screen p-4 gap-4 max-w-[1600px] mx-auto animate-fade-in transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-md dark:shadow-2xl rounded-2xl px-6 py-4 flex items-center justify-between shrink-0 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <div className="bg-red-600 p-2 rounded-lg shadow-sm dark:shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        <PlaySquare size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-none transition-colors">WatchParty</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">Synced YouTube playback</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gray-50 dark:bg-[#1A1F2B] border border-gray-200 dark:border-[#272D3D] shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222735] transition-colors"
                        title="Toggle theme"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors">{username}</span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-2 rounded mt-0.5 uppercase tracking-wider transition-colors">{currentUserRole}</span>
                    </div>

                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 transition-colors"></div>

                    <button
                        onClick={copyRoomCode}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 font-bold py-2 px-4 rounded-xl transition-all text-sm group"
                        title="Click to copy room code"
                    >
                        <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Room:</span>
                        <span className="font-mono text-gray-900 dark:text-white tracking-widest transition-colors">{roomId}</span>
                        <LinkIcon size={14} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white ml-1 transition-colors" />
                    </button>

                    <button
                        onClick={onLeave}
                        className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600 border border-red-500/50 hover:border-red-600 text-red-400 hover:text-white font-bold py-2 px-4 rounded-xl transition-all text-sm"
                    >
                        <LogOut size={16} />
                        Leave
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 gap-4 overflow-hidden">
                {/* Left Column: Video & Controls */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 shadow-inner dark:shadow-2xl transition-colors duration-300">
                        <VideoPlayer socket={socket} roomState={roomState} currentUserRole={currentUserRole} />
                    </div>

                    {hasPermission && (
                        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-md dark:shadow-2xl rounded-2xl p-4 shrink-0 transition-colors duration-300">
                            <form onSubmit={handleChangeVideo} className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Paste YouTube URL or Video ID to change video"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="flex-grow bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl transition-all text-sm whitespace-nowrap shadow-[0_4px_14px_0_rgba(220,38,38,0.39)]"
                                >
                                    Change Video
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right Column: Sidebar (Participants + Chat) */}
                <div className="w-[340px] shrink-0 flex flex-col gap-4 overflow-hidden h-full">
                    <div className="flex-grow min-h-[40%] overflow-hidden">
                        <ParticipantList
                            socket={socket}
                            participants={participants}
                            currentUserRole={currentUserRole}
                            currentUserId={currentUserId}
                        />
                    </div>
                    <div className="h-[50%] shrink-0">
                        <Chat socket={socket} username={username} theme={theme} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomView;
