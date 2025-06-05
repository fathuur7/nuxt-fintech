import { User } from '../models/User';

export class UserStatusService {
  static async setUserOnline(userId: string): Promise<any> {
    return await User.findByIdAndUpdate(
      userId,
      {
        isActive: true,
        status: 'online',
        lastSeen: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  static async setUserOffline(userId: string): Promise<any> {
    return await User.findByIdAndUpdate(
      userId,
      {
        isActive: false,
        status: 'offline',
        lastSeen: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  static async setUserIdle(userId: string): Promise<any> {
    return await User.findByIdAndUpdate(
      userId,
      {
        status: 'idle',
        lastSeen: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  static async updateHeartbeat(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      lastSeen: new Date(),
      isActive: true,
      status: 'online'
    });
  }

  static async findStaleUsers(staleThreshold: number): Promise<any[]> {
    const now = new Date();
    return await User.find({
      isActive: true,
      lastSeen: { $lt: new Date(now.getTime() - staleThreshold) }
    });
  }
}