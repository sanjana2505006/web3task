import React, { useState } from 'react';
import { User, Shield, ShieldAlert, X, ChevronDown } from 'lucide-react';
import type { Participant, UserRole } from '../App';
import { Socket } from 'socket.io-client';

interface ParticipantListProps {
    socket: Socket;
    participants: Participant[];
    currentUserRole: UserRole;
    currentUserId: string;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ socket, participants, currentUserRole, currentUserId }) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        socket.emit('assign_role', { targetUserId: userId, role: newRole });
        setOpenMenuId(null);
    };

    const handleKick = (userId: string) => {
        if (confirm("Are you sure you want to remove this user?")) {
            socket.emit('remove_participant', userId);
        }
        setOpenMenuId(null);
    };

    const RoleIcon = ({ role }: { role: UserRole }) => {
        switch (role) {
            case 'Host': return <ShieldAlert size={16} className="text-red-500" />;
            case 'Moderator': return <Shield size={16} className="text-blue-400" />;
            default: return <User size={16} className="text-gray-400" />;
        }
    };

    const RoleBadge = ({ role }: { role: UserRole }) => {
        const colors = {
            Host: 'bg-red-500/20 text-red-400 border-red-500/30',
            Moderator: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            Participant: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        };

        return (
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${colors[role]}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="glass-panel h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-700/50 bg-gray-800/30 flex items-center justify-between">
                <h3 className="font-bold text-lg">Participants</h3>
                <span className="bg-gray-700 text-xs px-2 py-1 rounded-full font-medium">{participants.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {participants.map((p) => (
                    <div key={p.userId} className={`p-3 rounded-xl flex items-center justify-between transition-colors ${p.userId === currentUserId ? 'bg-white/5 border border-white/10' : 'hover:bg-white/5 border border-transparent'} relative group`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                                <RoleIcon role={p.role} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-gray-200">
                                    {p.username} {p.userId === currentUserId && <span className="text-gray-500 text-xs ml-1">(You)</span>}
                                </span>
                                <div className="mt-1">
                                    <RoleBadge role={p.role} />
                                </div>
                            </div>
                        </div>

                        {/* Admin Controls */}
                        {currentUserRole === 'Host' && p.userId !== currentUserId && (
                            <div className="relative">
                                <button
                                    onClick={() => setOpenMenuId(openMenuId === p.userId ? null : p.userId)}
                                    className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                >
                                    <ChevronDown size={16} />
                                </button>

                                {openMenuId === p.userId && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 py-2 animate-fade-in-up origin-top-right">
                                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Change Role</div>
                                            <button
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2 ${p.role === 'Participant' ? 'text-gray-400' : 'text-gray-200'}`}
                                                onClick={() => handleRoleChange(p.userId, 'Participant')}
                                            >
                                                <User size={14} /> Make Participant
                                            </button>
                                            <button
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center gap-2 ${p.role === 'Moderator' ? 'text-blue-400' : 'text-blue-200'}`}
                                                onClick={() => handleRoleChange(p.userId, 'Moderator')}
                                            >
                                                <Shield size={14} /> Make Moderator
                                            </button>

                                            <div className="border-t border-gray-700 my-1"></div>
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"
                                                onClick={() => handleKick(p.userId)}
                                            >
                                                <X size={14} /> Remove User
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Show kick option to Moderators for normal participants */}
                        {currentUserRole === 'Moderator' && p.role === 'Participant' && (
                            <button
                                onClick={() => handleKick(p.userId)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove Participant"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParticipantList;
