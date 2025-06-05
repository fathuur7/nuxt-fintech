// import { io, Socket } from 'socket.io-client';


// interface MessageData {
//   senderId: string;
//   receiverId: string;
//   content: string;
//   messageType?: 'text' | 'image' | 'file';
//   attachmentUrl?: string;
//   attachmentType?: string;
//   attachmentSize?: number;
// }

// interface TypingData {
//   senderId: string;
//   receiverId: string;
//   isTyping: boolean;
// }

// interface MessageStatusUpdate {
//   messageId: string;
//   status: 'delivered' | 'read';
//   userId: string;
// }

// interface UserStatusData {
//   userId: string;
//   status: 'online' | 'offline' | 'idle';
//   isActive: boolean;
//   timestamp: string;
//   userName: string;
// }

// interface ReceivedMessage {
//   _id: string;
//   senderId: {
//     _id: string;
//     name: string;
//     email: string;
//   };
//   receiverId: {
//     _id: string;
//     name: string;
//     email: string;
//   };
//   content: string;
//   messageType: 'text' | 'image' | 'file';
//   attachmentUrl?: string;
//   attachmentType?: string;
//   attachmentSize?: number;
//   status: 'sent' | 'delivered' | 'read';
//   isRead: boolean;
//   readAt?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // Event callback types
// type MessageReceivedCallback = (message: ReceivedMessage) => void;
// type MessageSentCallback = (message: ReceivedMessage) => void;
// type MessageStatusCallback = (data: { messageId: string; status: string }) => void;
// type TypingStatusCallback = (data: { userId: string; isTyping: boolean }) => void;
// type UserStatusCallback = (data: UserStatusData) => void;
// type UnreadCountCallback = (data: { count: number }) => void;
// type ConnectCallback = () => void;
// type DisconnectCallback = (reason: string) => void;
// type ErrorCallback = (error: any) => void;

// export class SocketMessageClient {
//   private socket: Socket;
//   private userId: string;
//   private isConnected: boolean = false;
//   private reconnectAttempts: number = 0;
//   private maxReconnectAttempts: number = 5;
//   private heartbeatInterval: NodeJS.Timeout | null = null;

//   // Event callbacks
//   private onMessageReceived?: MessageReceivedCallback;
//   private onMessageSent?: MessageSentCallback;
//   private onMessageStatusUpdated?: MessageStatusCallback;
//   private onTypingStatus?: TypingStatusCallback;
//   private onUserStatusUpdate?: UserStatusCallback;
//   private onUnreadCountUpdate?: UnreadCountCallback;
//   private onConnect?: ConnectCallback;
//   private onDisconnect?: DisconnectCallback;
//   private onError?: ErrorCallback;

//   constructor(
//     userId: string, 
//     serverUrl: string = 'http://localhost:3002'
//   ) {
//     this.userId = userId;
    
//     // Initialize Socket.IO connection
//     this.socket = io(serverUrl, {
//       transports: ['websocket', 'polling'],
//       timeout: 20000,
//       reconnection: true,
//       reconnectionAttempts: this.maxReconnectAttempts,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       autoConnect: true
//     });

//     this.setupEventListeners();
//   }

//   // ========================================
//   // CONNECTION MANAGEMENT
//   // ========================================
//   private setupEventListeners(): void {
//     // Connection events
//     this.socket.on('connect', () => {
//       console.log('✅ Connected to Socket.IO server');
//       this.isConnected = true;
//       this.reconnectAttempts = 0;
//       this.authenticateUser();
//       this.startHeartbeat();
//       this.onConnect?.();
//     });

//     this.socket.on('disconnect', (reason) => {
//       console.log(`❌ Disconnected from server: ${reason}`);
//       this.isConnected = false;
//       this.stopHeartbeat();
//       this.onDisconnect?.(reason);
//     });

//     this.socket.on('connect_error', (error) => {
//       console.error('❌ Connection error:', error);
//       this.reconnectAttempts++;
//       this.onError?.(error);
//     });

//     this.socket.on('reconnect', (attemptNumber) => {
//       console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
//       this.authenticateUser();
//     });

//     this.socket.on('reconnect_failed', () => {
//       console.error('❌ Failed to reconnect after maximum attempts');
//       this.onError?.(new Error('Reconnection failed'));
//     });

//     // Message events
//     this.socket.on('message:received', (message: ReceivedMessage) => {
//       console.log('📨 Message received:', message);
//       this.onMessageReceived?.(message);
      
//       // Auto-mark as delivered
//       this.updateMessageStatus(message._id, 'delivered');
//     });

//     this.socket.on('message:sent', (message: ReceivedMessage) => {
//       console.log('📤 Message sent:', message);
//       this.onMessageSent?.(message);
//     });

//     this.socket.on('message:status_updated', (data: { messageId: string; status: string }) => {
//       console.log('📋 Message status updated:', data);
//       this.onMessageStatusUpdated?.(data);
//     });

//     // Typing events
//     this.socket.on('user:typing', (data: { userId: string; isTyping: boolean }) => {
//       console.log('⌨️ Typing status:', data);
//       this.onTypingStatus?.(data);
//     });

//     // User status events
//     this.socket.on('user-status-update', (data: UserStatusData) => {
//       console.log('👤 User status update:', data);
//       this.onUserStatusUpdate?.(data);
//     });

//     this.socket.on('user-online', (data: UserStatusData) => {
//       console.log('🟢 User online:', data);
//       this.onUserStatusUpdate?.(data);
//     });

//     this.socket.on('user-offline', (data: UserStatusData) => {
//       console.log('🔴 User offline:', data);
//       this.onUserStatusUpdate?.(data);
//     });

//     this.socket.on('user-idle', (data: UserStatusData) => {
//       console.log('🟡 User idle:', data);
//       this.onUserStatusUpdate?.(data);
//     });

//     // Unread count events
//     this.socket.on('messages:unread_count', (data: { count: number }) => {
//       console.log('📊 Unread count update:', data);
//       this.onUnreadCountUpdate?.(data);
//     });

//     // Error handling
//     this.socket.on('error', (error: any) => {
//       console.error('❌ Socket error:', error);
//       this.onError?.(error);
//     });
//   }

//   private authenticateUser(): void {
//     if (this.isConnected && this.userId) {
//       console.log(`🔐 Authenticating user: ${this.userId}`);
//       this.socket.emit('user-active', this.userId);
//     }
//   }

//   private startHeartbeat(): void {
//     this.stopHeartbeat();
//     this.heartbeatInterval = setInterval(() => {
//       if (this.isConnected) {
//         this.socket.emit('heartbeat', this.userId);
//       }
//     }, 30000); // Send heartbeat every 30 seconds
//   }

//   private stopHeartbeat(): void {
//     if (this.heartbeatInterval) {
//       clearInterval(this.heartbeatInterval);
//       this.heartbeatInterval = null;
//     }
//   }

//   sendMessage(receiverId: string, content: string): void {
//     if (!this.isConnected) {
//       console.warn('⚠️ Cannot send message: Not connected to server');
//       return;
//     }

//     const messageData: MessageData = {
//       senderId: this.userId,
//       receiverId,
//       content,
//       messageType: 'text'
//     };

//     console.log('📤 Sending message:', messageData);
//     this.socket.emit('message:send', messageData);
//   }

//   /**
//    * Send a message with attachment
//    */
//   sendMessageWithAttachment(
//     receiverId: string, 
//     content: string, 
//     attachmentUrl: string,
//     attachmentType: string,
//     attachmentSize?: number
//   ): void {
//     if (!this.isConnected) {
//       console.warn('⚠️ Cannot send message: Not connected to server');
//       return;
//     }

//     const messageType: 'image' | 'file' = attachmentType.startsWith('image/') ? 'image' : 'file';

//     const messageData: MessageData = {
//       senderId: this.userId,
//       receiverId,
//       content,
//       messageType,
//       attachmentUrl,
//       attachmentType,
//       attachmentSize
//     };

//     console.log('📎 Sending message with attachment:', messageData);
//     this.socket.emit('message:send', messageData);
//   }

//   /**
//    * Update message status (delivered/read)
//    */
//   updateMessageStatus(messageId: string, status: 'delivered' | 'read'): void {
//     if (!this.isConnected) {
//       console.warn('⚠️ Cannot update message status: Not connected to server');
//       return;
//     }

//     const statusUpdate: MessageStatusUpdate = {
//       messageId,
//       status,
//       userId: this.userId
//     };

//     console.log('📋 Updating message status:', statusUpdate);
//     this.socket.emit('message:update_status', statusUpdate);
//   }

//   /**
//    * Mark all messages from a user as read
//    */
//   markMessagesAsRead(senderId: string): void {
//     if (!this.isConnected) {
//       console.warn('⚠️ Cannot mark messages as read: Not connected to server');
//       return;
//     }

//     console.log(`👁️ Marking messages as read from user: ${senderId}`);
//     this.socket.emit('message:mark_read', {
//       senderId,
//       receiverId: this.userId
//     });
//   }

//   sendTypingStatus(receiverId: string, isTyping: boolean): void {
//     if (!this.isConnected) {
//       return;
//     }

//     const typingData: TypingData = {
//       senderId: this.userId,
//       receiverId,
//       isTyping
//     };

//     this.socket.emit('user:typing', typingData);
//   }

//   /**
//    * Start typing indicator
//    */
//   startTyping(receiverId: string): void {
//     this.sendTypingStatus(receiverId, true);
//   }

//   /**
//    * Stop typing indicator
//    */
//   stopTyping(receiverId: string): void {
//     this.sendTypingStatus(receiverId, false);
//   }

 
//   setUserActive(): void {
//     if (this.isConnected) {
//       console.log('🟢 Setting user as active');
//       this.socket.emit('user-active', this.userId);
//     }
//   }

//   setUserIdle(): void {
//     if (this.isConnected) {
//       console.log('🟡 Setting user as idle');
//       this.socket.emit('user-idle', this.userId);
//     }
//   }

//   /**
//    * Set user as offline
//    */
//   setUserOffline(): void {
//     if (this.isConnected) {
//       console.log('🔴 Setting user as offline');
//       this.socket.emit('user-offline', this.userId);
//     }
//   }
  
//   onMessageReceive(callback: MessageReceivedCallback): void {
//     this.onMessageReceived = callback;
//   }

//   onMessageSend(callback: MessageSentCallback): void {
//     this.onMessageSent = callback;
//   }

//   onMessageStatusUpdate(callback: MessageStatusCallback): void {
//     this.onMessageStatusUpdated = callback;
//   }

//   onTyping(callback: TypingStatusCallback): void {
//     this.onTypingStatus = callback;
//   }

//   onUserStatus(callback: UserStatusCallback): void {
//     this.onUserStatusUpdate = callback;
//   }

//   onUnreadCount(callback: UnreadCountCallback): void {
//     this.onUnreadCountUpdate = callback;
//   }

//   onConnection(callback: ConnectCallback): void {
//     this.onConnect = callback;
//   }

//   onDisconnection(callback: DisconnectCallback): void {
//     this.onDisconnect = callback;
//   }

//   onSocketError(callback: ErrorCallback): void {
//     this.onError = callback;
//   }

  
//   connect(): void {
//     if (!this.isConnected) {
//       console.log('🔌 Connecting to server...');
//       this.socket.connect();
//     }
//   }

//   /**
//    * Disconnect from server
//    */
//   disconnect(): void {
//     console.log('🔌 Disconnecting from server...');
//     this.setUserOffline();
//     this.stopHeartbeat();
//     this.socket.disconnect();
//     this.isConnected = false;
//   }

//   /**
//    * Get connection status
//    */
//   getConnectionStatus(): boolean {
//     return this.isConnected;
//   }

//   /**
//    * Get socket ID
//    */
//   getSocketId(): string | undefined {
//     return this.socket.id;
//   }

//   /**
//    * Get current user ID
//    */
//   getUserId(): string {
//     return this.userId;
//   }

  
//   emit(event: string, data?: any): void {
//     if (this.isConnected) {
//       this.socket.emit(event, data);
//     }
//   }


//   on(event: string, callback: (...args: any[]) => void): void {
//     this.socket.on(event, callback);
//   }

//   /**
//    * Remove event listener
//    */
//   off(event: string, callback?: (...args: any[]) => void): void {
//     this.socket.off(event, callback);
//   }

//   /**
//    * Remove all listeners for an event
//    */
//   removeAllListeners(event?: string): void {
//     this.socket.removeAllListeners(event);
//   }
// }

// export default SocketMessageClient;