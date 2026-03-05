import React, { useState, useEffect } from 'react';

import { useGoogleLogin } from '@react-oauth/google';


interface LandingViewProps {
    onJoin: (roomId: string, username: string) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    initialRoomId?: string;
}

const LandingView: React.FC<LandingViewProps> = ({ onJoin, theme, toggleTheme, initialRoomId = '' }) => {
    const [roomId, setRoomId] = useState(initialRoomId);
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (initialRoomId) setRoomId(initialRoomId);
    }, [initialRoomId]);

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

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            console.log('Login Success:', codeResponse);
            // In a real app, you'd send codeResponse.access_token to your backend
            // For now, we'll simulate getting user info if we had a profile endpoint
            // or just use the fact that they logged in to set a "Google User" name.
            // Since we're using @react-oauth/google, we might need to fetch user info manually
            // if we only get an access token.
            fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${codeResponse.access_token}`)
                .then(res => res.json())
                .then(data => {
                    if (data.name) {
                        setUsername(data.name);
                        // Auto-join if roomId exists (e.g., from deep link), otherwise create a new one
                        const finalRoomId = roomId ? roomId.toUpperCase() : generateRoomId();
                        onJoin(finalRoomId, data.name);
                    }
                })
                .catch(err => console.error('Failed to fetch user info:', err));
        },
        onError: (error) => console.log('Login Failed:', error)
    });

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-white dark:bg-[#0A0D14] transition-colors duration-500 overflow-hidden font-sans">
            {/* Left Side: Illustration */}
            <div className="hidden md:block md:w-1/2 h-full relative overflow-hidden">
                <img
                    src="/landing_dragon.png"
                    alt="Majestic Dragon Illustration"
                    className="absolute inset-0 w-full h-full object-cover transform scale-105 animate-subtle-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 dark:to-[#0A0D14]/20 pointer-events-none"></div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-16 relative bg-white dark:bg-[#0A0D14] transition-colors duration-500">
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="absolute top-8 right-8 p-2.5 rounded-full bg-gray-50 dark:bg-[#1A1F2B] border border-gray-100 dark:border-[#272D3D] shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110 active:scale-95 z-50"
                    title="Toggle theme"
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <div className="max-w-[400px] w-full space-y-12 animate-fade-in-up">
                    {/* Brand */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-5xl font-light tracking-widest text-gray-900 dark:text-white uppercase whitespace-nowrap">
                            WATCH <span className="font-bold text-red-600">PARTY</span>
                        </h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium tracking-tight">
                            Log in below or <span className="text-gray-900 dark:text-white font-bold cursor-pointer hover:underline">sign up</span> to create a YT watch party room
                        </p>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => login()}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-50 dark:bg-[#1A1F2B] border border-gray-100 dark:border-[#272D3D] rounded-xl text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-[#222735] transition-all hover:-translate-y-0.5 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                <path fill="none" d="M0 0h48v48H0z"/>
                            </svg>
                            Sign in with Google
                        </button>
                    </div>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-600 text-xs font-bold tracking-widest uppercase">or</span>
                        <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
                    </div>

                    {/* Form */}
                    <form className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Username or room code"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#1A1F2B] border border-gray-100 dark:border-[#272D3D] text-gray-900 dark:text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400 dark:placeholder-gray-600 text-sm shadow-sm"
                                    maxLength={20}
                                />
                            </div>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Room Code (optional for creating)"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#1A1F2B] border border-gray-100 dark:border-[#272D3D] text-gray-900 dark:text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400 dark:placeholder-gray-600 text-sm uppercase font-mono shadow-sm"
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleJoinRoom}
                                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg dark:shadow-white/5 text-sm uppercase tracking-widest"
                            >
                                Log in
                            </button>
                            <button
                                onClick={handleCreateRoom}
                                className="w-full bg-white dark:bg-[#1A1F2B] border border-gray-200 dark:border-[#272D3D] text-gray-900 dark:text-white font-bold py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-[#222735] transition-all text-sm uppercase tracking-widest shadow-sm"
                            >
                                Create Room
                            </button>
                        </div>

                        <div className="text-center pt-4">
                            <button type="button" className="text-xs font-bold text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest">
                                Forgot password?
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LandingView;
