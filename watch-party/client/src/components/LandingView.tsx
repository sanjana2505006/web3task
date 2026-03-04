import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface LandingViewProps {
    onJoin: (roomId: string, username: string) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onJoin }) => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const generateRoomId = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return alert('Please enter a username');
        const newRoomId = generateRoomId();
        onJoin(newRoomId, username);
    };

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !roomId) return alert('Please enter both username and room code');
        onJoin(roomId.toUpperCase(), username);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="glass-panel p-8 max-w-md w-full text-center space-y-8 animate-fade-in">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-600 p-4 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                        <Play size={48} className="text-white ml-2" />
                    </div>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                    Watch<span className="text-red-500">Party</span>
                </h1>
                <p className="text-gray-400 mb-8">Watch YouTube together in perfect sync.</p>

                <form className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Your Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder-gray-500"
                            maxLength={20}
                        />
                    </div>

                    <div className="pt-4 space-y-4">
                        <button
                            onClick={handleCreateRoom}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-1 active:translate-y-0"
                        >
                            Create New Room
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-700"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm font-medium">OR</span>
                            <div className="flex-grow border-t border-gray-700"></div>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Room Code"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="flex-grow bg-gray-800/50 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all uppercase placeholder-gray-500"
                                maxLength={6}
                            />
                            <button
                                onClick={handleJoinRoom}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LandingView;
