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

export interface MessageData {
  senderId: string;
  receiverId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentSize?: number;
}

export interface TypingData {
  senderId: string;
  receiverId: string;
  isTyping: boolean;
}

export interface MessageStatusUpdate {
  messageId: string;
  status: 'delivered' | 'read';
  userId: string;
}