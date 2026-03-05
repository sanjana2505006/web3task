require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {
    ROLES, joinRoom, leaveRoom, getRoom, getUserRole,
    hasPermission, updateRoomState, assignRole, transferHost, users
} = require('./roomManager');

// Allowed origins: comma-separated list in CLIENT_URL env var, or allow all in development
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173'];

const app = express();
app.use(cors({ origin: allowedOrigins }));

// Health check endpoint (useful for Render/Railway)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (data) => {
        const { roomId, username } = data;
        const participant = joinRoom(roomId, { userId: socket.id, username });

        socket.join(roomId);
        const room = getRoom(roomId);

        // Send current state to newly joined user
        socket.emit('sync_state', {
            playState: room.playState,
            currentTime: room.currentTime,
            videoId: room.videoId
        });

        // Notify room of the new user and updated participants
        io.to(roomId).emit('user_joined', participant);
        io.to(roomId).emit('room_users', room.participants);
    });

    socket.on('leave_room', (data) => {
        const { roomId } = data;
        const user = leaveRoom(socket.id);
        if (user) {
            socket.leave(roomId);
            io.to(roomId).emit('user_left', { userId: socket.id, username: user.username });
            const room = getRoom(roomId);
            if (room) {
                io.to(roomId).emit('room_users', room.participants);
            }
        }
    });

    socket.on('disconnect', () => {
        const user = leaveRoom(socket.id);
        if (user) {
            io.to(user.roomId).emit('user_left', { userId: socket.id, username: user.username });
            const room = getRoom(user.roomId);
            if (room) {
                io.to(user.roomId).emit('room_users', room.participants);
            }
        }
        console.log('User disconnected:', socket.id);
    });

    // Playback controls
    socket.on('play', () => {
        const user = users.get(socket.id);
        if (!user) return;
        const role = getUserRole(user.roomId, socket.id);
        if (hasPermission(role)) {
            updateRoomState(user.roomId, { playState: 'playing' });
            socket.to(user.roomId).emit('play');
        }
    });

    socket.on('pause', () => {
        const user = users.get(socket.id);
        if (!user) return;
        const role = getUserRole(user.roomId, socket.id);
        if (hasPermission(role)) {
            updateRoomState(user.roomId, { playState: 'paused' });
            socket.to(user.roomId).emit('pause');
        }
    });

    socket.on('seek', (time) => {
        const user = users.get(socket.id);
        if (!user) return;
        const role = getUserRole(user.roomId, socket.id);
        if (hasPermission(role)) {
            updateRoomState(user.roomId, { currentTime: time });
            socket.to(user.roomId).emit('seek', time);
        }
    });

    socket.on('change_video', (videoId) => {
        const user = users.get(socket.id);
        if (!user) return;
        const role = getUserRole(user.roomId, socket.id);
        if (hasPermission(role)) {
            updateRoomState(user.roomId, { videoId, playState: 'paused', currentTime: 0 });
            io.to(user.roomId).emit('change_video', videoId);
        }
    });

    // Time sync from host
    socket.on('sync_time', (time) => {
        const user = users.get(socket.id);
        if (!user) return;
        const role = getUserRole(user.roomId, socket.id);
        if (hasPermission(role)) { // allow moderator/host to sync time
            updateRoomState(user.roomId, { currentTime: time });
            // Only broadcast to other clients periodically if needed,
            // or just keep server state updated for newly joined users.
        }
    });

    // Role management
    socket.on('assign_role', (data) => {
        const { targetUserId, role: newRole } = data;
        const user = users.get(socket.id);
        if (!user) return;
        const role = getUserRole(user.roomId, socket.id);
        if (role === ROLES.HOST) {
            const success = assignRole(user.roomId, targetUserId, newRole);
            if (success) {
                const room = getRoom(user.roomId);
                io.to(user.roomId).emit('role_assigned', {
                    targetUserId,
                    role: newRole,
                    participants: room.participants
                });
                io.to(user.roomId).emit('room_users', room.participants);
            }
        }
    });

    socket.on('remove_participant', (targetUserId) => {
        const user = users.get(socket.id);
        if (!user) return;
        const role = getUserRole(user.roomId, socket.id);
        if (role === ROLES.HOST) {
            const removedUser = leaveRoom(targetUserId);
            if (removedUser) {
                io.to(targetUserId).emit('kicked');
                const targetSocket = io.sockets.sockets.get(targetUserId);
                if (targetSocket) targetSocket.leave(user.roomId);

                const room = getRoom(user.roomId);
                io.to(user.roomId).emit('participant_removed', {
                    userId: targetUserId,
                    participants: room ? room.participants : []
                });
                if (room) {
                    io.to(user.roomId).emit('room_users', room.participants);
                }
            }
        }
    });

    // Chat
    socket.on('send_message', (text) => {
        const user = users.get(socket.id);
        if (!user) return;
        io.to(user.roomId).emit('receive_message', {
            userId: socket.id,
            username: user.username,
            text,
            timestamp: new Date().toISOString()
        });
    });

    // Transfer Host
    socket.on('transfer_host', (targetUserId) => {
        const user = users.get(socket.id);
        if (!user) return;
        const success = transferHost(user.roomId, socket.id, targetUserId);
        if (success) {
            const room = getRoom(user.roomId);
            io.to(user.roomId).emit('host_transferred', {
                newHostId: targetUserId,
                participants: room.participants
            });
            io.to(user.roomId).emit('room_users', room.participants);
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
