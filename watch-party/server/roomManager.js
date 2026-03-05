const rooms = new Map(); // roomId -> { videoId, playState, currentTime, participants }
const users = new Map(); // socketId -> { roomId, username, userId }

const ROLES = {
  HOST: 'Host',
  MODERATOR: 'Moderator',
  PARTICIPANT: 'Participant'
};

function initRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      videoId: 'dQw4w9WgXcQ', // Default cool video
      playState: 'paused',
      currentTime: 0,
      participants: []
    });
  }
}

function getRoom(roomId) {
  return rooms.get(roomId);
}

function joinRoom(roomId, user) {
  initRoom(roomId);
  const room = rooms.get(roomId);

  // First person to join becomes the Host
  let role = ROLES.PARTICIPANT;
  if (room.participants.length === 0) {
    role = ROLES.HOST;
  }

  const participant = { ...user, role };
  room.participants.push(participant);
  users.set(user.userId, { roomId, username: user.username, userId: user.userId });

  return participant;
}

function leaveRoom(userId) {
  const user = users.get(userId);
  if (!user) return null;

  const room = rooms.get(user.roomId);
  if (room) {
    room.participants = room.participants.filter(p => p.userId !== userId);

    // Clean up empty rooms
    if (room.participants.length === 0) {
      rooms.delete(user.roomId);
    } else {
      // Reassign host if the host left
      const hasHost = room.participants.some(p => p.role === ROLES.HOST);
      if (!hasHost && room.participants.length > 0) {
        room.participants[0].role = ROLES.HOST;
      }
    }
  }

  users.delete(userId);
  return user;
}

function getUserRole(roomId, userId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  const participant = room.participants.find(p => p.userId === userId);
  return participant ? participant.role : null;
}

function hasPermission(role) {
  return role === ROLES.HOST || role === ROLES.MODERATOR;
}

function updateRoomState(roomId, newState) {
  const room = rooms.get(roomId);
  if (room) {
    Object.assign(room, newState);
  }
}

function assignRole(roomId, targetUserId, newRole) {
  const room = rooms.get(roomId);
  if (!room) return false;
  const target = room.participants.find(p => p.userId === targetUserId);
  if (target) {
    target.role = newRole;
    return true;
  }
  return false;
}

function transferHost(roomId, currentHostId, newHostId) {
  const room = rooms.get(roomId);
  if (!room) return false;

  const currentHost = room.participants.find(p => p.userId === currentHostId);
  const newHost = room.participants.find(p => p.userId === newHostId);

  if (currentHost && newHost && currentHost.role === ROLES.HOST) {
    currentHost.role = ROLES.MODERATOR; // Demote previous host to Moderator
    newHost.role = ROLES.HOST;
    return true;
  }
  return false;
}

module.exports = {
  rooms,
  users,
  ROLES,
  joinRoom,
  leaveRoom,
  getRoom,
  getUserRole,
  hasPermission,
  updateRoomState,
  assignRole,
  transferHost
};
