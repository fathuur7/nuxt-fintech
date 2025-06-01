export interface UserStatusData {
  userId: string;
  status: 'online' | 'offline' | 'idle';
  isActive: boolean;
  timestamp: string;
  userName: string;
}

export interface SocketMaps {
  userMap: Map<string, string>; // socketId -> userId
  userSockets: Map<string, string>; // userId -> socketId
  disconnectTimeouts: Map<string, NodeJS.Timeout>; // userId -> timeout
}