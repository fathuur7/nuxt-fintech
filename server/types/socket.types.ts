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

export interface MessageSocketEvents {
  // Client to server events
  send_message: (data: {
    senderId: string;
    receiverId: string;
    content: string;
    messageType?: 'text' | 'image' | 'file';
    attachmentUrl?: string;
    attachmentType?: string;
    attachmentSize?: number;
    tempId?: string;
  }) => void;

  message_delivered: (data: { messageId: string; userId: string }) => void;
  message_read: (data: { messageId: string; userId: string }) => void;
  join_conversation: (data: { senderId: string; receiverId: string }) => void;
  leave_conversation: (data: { senderId: string; receiverId: string }) => void;
  typing_start: (data: { senderId: string; receiverId: string }) => void;
  typing_stop: (data: { senderId: string; receiverId: string }) => void;
  get_messages: (data: { senderId: string; receiverId: string; page?: number; limit?: number }) => void;
  get_conversations: (data: { userId: string }) => void;
  get_unread_count: (data: { userId: string }) => void;
  mark_conversation_read: (data: { senderId: string; receiverId: string }) => void;
  delete_message: (data: { messageId: string; userId: string }) => void;
  edit_message: (data: { messageId: string; userId: string; newContent: string }) => void;

  // Server to client events
  new_message: (data: { message: any; conversationId: string }) => void;
  message_notification: (data: { message: any; senderId: string; senderName: string }) => void;
  message_sent: (data: { message: any; tempId?: string }) => void;
  message_status_update: (data: { messageId: string; status: string; timestamp: Date; readAt?: Date }) => void;
  user_typing: (data: { userId: string; isTyping: boolean; conversationId: string }) => void;
  typing_notification: (data: { userId: string; isTyping: boolean }) => void;
  messages_loaded: (data: { messages: any[]; pagination: any }) => void;
  conversations_loaded: (data: { conversations: any[] }) => void;
  unread_count_loaded: (data: { count: number }) => void;
  conversation_joined: (data: { conversationId: string; participants: string[] }) => void;
  conversation_read: (data: { conversationWith: string; readAt: Date }) => void;
  message_deleted: (data: { messageId: string; deletedBy: string }) => void;
  message_edited: (data: { message: any; editedAt: Date }) => void;

  // Error events
  message_error: (data: { error: string }) => void;
  messages_error: (data: { error: string }) => void;
  conversations_error: (data: { error: string }) => void;
  unread_count_error: (data: { error: string }) => void;
  message_delete_error: (data: { error: string }) => void;
  message_edit_error: (data: { error: string }) => void;
  conversation_read_error: (data: { error: string }) => void;
}