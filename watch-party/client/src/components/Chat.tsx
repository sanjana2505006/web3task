import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface Message {
    userId: string;
    username: string;
    text: string;
    timestamp: string;
}

interface ChatProps {
    socket: Socket;
    username: string;
    theme: 'light' | 'dark';
}

const Chat: React.FC<ChatProps> = ({ socket, username, theme }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        socket.on('receive_message', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [socket]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            socket.emit('send_message', input.trim());
            setInput('');
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all z-50 animate-bounce"
            >
                <MessageSquare size={24} />
            </button>
        );
    }

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-[#13161C] border-l ${theme === 'dark' ? 'border-[#222735]' : 'border-gray-100'} w-full md:w-[320px] transition-colors duration-300`}>
            <div className="p-4 border-b border-gray-100 dark:border-[#222735] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-red-600" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Chat</h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-400 dark:text-gray-600 text-xs uppercase tracking-widest mb-1 italic">
                            Welcome, {username}!
                        </p>
                        <p className="text-gray-300 dark:text-gray-700 text-[10px]">
                            No messages yet. Say hi!
                        </p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.userId === socket.id ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                                {msg.userId === socket.id ? 'You' : msg.username}
                            </span>
                            <span className="text-[9px] text-gray-300 dark:text-gray-600 pr-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm ${msg.userId === socket.id
                            ? 'bg-red-600 text-white rounded-tr-none'
                            : 'bg-gray-100 dark:bg-[#1A1F2B] text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-50 dark:border-[#272D3D]'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-[#222735] bg-gray-50/50 dark:bg-black/20">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-white dark:bg-[#1A1F2B] border border-gray-200 dark:border-[#272D3D] text-gray-900 dark:text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm placeholder-gray-400 dark:placeholder-gray-600"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-red-600 hover:text-red-700 disabled:text-gray-300 dark:disabled:text-gray-700 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
