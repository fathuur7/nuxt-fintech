import { Socket } from 'socket.io';
import { ConnectionManager } from '../services/ConnectionManager';
import { User } from '../models/User';
import { BroadcastService } from '../services/BroadcastService';
import type { SocketMaps } from '../types/socket.types';
import { MessageHandlers } from '../handlers/MessageHandlers';

export class SocketEventHandlers {
    private messageHandlers: MessageHandlers;

    constructor(
        private connectionManager: ConnectionManager,
        private broadcastService: BroadcastService,
        private socketMaps: SocketMaps
    ) {
        this.messageHandlers = new MessageHandlers(connectionManager, broadcastService, socketMaps);
    }

    public registerHandlers(socket: Socket): void {
        // ✅ Removed the infinite recursive call
        
        // Register message handlers
        this.messageHandlers.registerMessageHandlers(socket);
        
        console.log('🔌 New connection:', socket.id);
        
        socket.on('user-active', (userId: string) => {
            this.connectionManager.handleUserActive(userId, socket.id);
        });

        // Event untuk logout manual
        socket.on('user-logout', (userId: string) => {
            console.log(`🚪 User ${userId} explicitly logging out`);
            this.connectionManager.handleUserOffline(userId, socket.id, 'client namespace disconnect');
        });

        // Event untuk explicit offline (bisa untuk testing)
        socket.on('user-offline', (userId: string) => {
            console.log(`🔴 User ${userId} explicitly going offline`);
            this.connectionManager.handleUserOffline(userId, socket.id, 'client namespace disconnect');
        });

        // Event ketika user akan menutup tab/browser (beforeunload)
        socket.on('user-beforeunload', (userId: string) => {
            console.log(`📄 User ${userId} closing page/tab`);
            this.connectionManager.handleUserOffline(userId, socket.id, 'beforeunload');
        });

        // Event ketika user berpindah halaman dalam SPA
        socket.on('user-navigating', (userId: string) => {
            console.log(`🔄 User ${userId} navigating within app`);
            // Tidak langsung offline, biarkan reconnect logic handle
        });

        // Event ketika user visibility berubah (pindah tab)
        socket.on('user-visibility-change', (data: { userId: string, hidden: boolean }) => {
            if (data.hidden) {
                console.log(`👁️ User ${data.userId} tab became hidden/inactive`);
                // Bisa set idle atau biarkan heartbeat handle
                this.connectionManager.handleUserIdle(data.userId);
            } else {
                console.log(`👁️ User ${data.userId} tab became visible/active`);
                this.connectionManager.handleUserActive(data.userId, socket.id);
            }
        });

        socket.on('force-user-offline', async (userId: string) => {
            console.log(`💥 Admin forcing user ${userId} offline`);
            await this.connectionManager.handleUserOffline(userId, socket.id, 'force_offline');
            
            // Send specific event for force offline
            const user = await User.findById(userId);
            if (user) {
                this.broadcastService.broadcastForceOffline(userId, user);
            }
        });

        socket.on('user-idle', (userId: string) => {
            this.connectionManager.handleUserIdle(userId);
        });

        socket.on('heartbeat', (userId: string) => {
            this.connectionManager.handleHeartbeat(userId, socket.id);
        });

        socket.on('disconnect', (reason) => {
            const userId = this.socketMaps.userMap.get(socket.id);
            console.log(`🔌 Socket ${socket.id} disconnected. Reason: ${reason}. UserId: ${userId}`);
            
            if (userId) {
                this.connectionManager.handleDisconnectWithTimeout(userId, socket.id, reason);
            }
        });
    }
}