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
        <div className="flex items-center justify-center min-h-screen p-4 bg-[#0A0D14]">
            <div className="bg-[#13161C] border border-[#222735] p-10 max-w-[440px] w-full text-center space-y-8 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] animate-fade-in relative overflow-hidden">
                {/* Subtle top glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-red-600/5 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="flex justify-center mb-2 relative z-10">
                    <div className="bg-[#E50914] w-[84px] h-[84px] flex items-center justify-center rounded-full shadow-[0_0_40px_rgba(229,9,20,0.5)] border-2 border-red-500/20">
                        <Play size={38} className="text-white ml-1.5 fill-white" strokeWidth={2.5} />
                    </div>
                </div>

                <div className="space-y-2 relative z-10">
                    <h1 className="text-[32px] font-extrabold tracking-tight text-white leading-none">
                        Watch<span className="text-[#E50914]">Party</span>
                    </h1>
                    <p className="text-[#8A96A8] text-[15px] font-medium">Watch YouTube together in perfect sync.</p>
                </div>

                <form className="space-y-6 relative z-10">
                    <div>
                        <input
                            type="text"
                            placeholder="Your Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#1A1F2B] border border-[#272D3D] text-white px-5 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder-[#58647A] text-[15px] shadow-inner"
                            maxLength={20}
                        />
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={handleCreateRoom}
                            className="w-full bg-[#E50914] hover:bg-[#F6121D] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_8px_25px_-5px_rgba(229,9,20,0.6)] hover:shadow-[0_12px_30px_-5px_rgba(229,9,20,0.7)] hover:-translate-y-0.5 active:translate-y-0 text-[15px]"
                        >
                            Create New Room
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-[#272D3D]"></div>
                            <span className="flex-shrink-0 mx-4 text-[#58647A] text-[13px] font-bold tracking-wider">OR</span>
                            <div className="flex-grow border-t border-[#272D3D]"></div>
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="ROOM CODE"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="flex-grow bg-[#1A1F2B] border border-[#272D3D] text-white px-5 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all uppercase placeholder-[#58647A] text-[15px] font-mono shadow-inner"
                                maxLength={6}
                            />
                            <button
                                onClick={handleJoinRoom}
                                className="bg-[#313B51] hover:bg-[#3D4964] border border-[#3D4964] hover:border-[#4B5978] text-white font-bold py-3.5 px-8 rounded-xl transition-all text-[15px] shadow-lg"
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
