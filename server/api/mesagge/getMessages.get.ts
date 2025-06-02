import { Message } from '~/server/models/Message'
import { connectDB } from '@/server/utils/mongoose' // Ensure this path is correct
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('[API HANDLER] Event handler started.');
  try {
    // --- DEBUGGING START ---
    console.log('[API HANDLER] Imported Message model:', Message);
    if (Message && typeof Message.getMessagesBetweenUsers === 'function') {
      console.log('[API HANDLER] getMessagesBetweenUsers method IS FOUND on Message model.');
    } else {
      console.error('[API HANDLER] getMessagesBetweenUsers method IS NOT FOUND on Message model.');
      console.log('[API HANDLER] Keys on Message model:', Object.keys(Message || {}));
      if (Message && Message.schema) {
         console.log('[API HANDLER] Statics on Message.schema:', Message.schema.statics);
      }
    }
    // --- DEBUGGING END ---

    await connectDB();
    console.log('[API HANDLER] Database connected.');
    
    const query = getQuery(event);
    const { userA, userB, limit = 50 } = query;
    const mongoose = require('mongoose');
    const userAObjectId = new mongoose.Types.ObjectId(String(userA));
    const userBObjectId = new mongoose.Types.ObjectId(String(userB));
    
    if (!userA || !userB) {
      console.log('[API HANDLER] Missing userA or userB parameter.');
      return {
        success: false,
        error: 'userA and userB parameters are required'
      };
    }
    
    console.log(`[API HANDLER] Calling Message.getMessagesBetweenUsers with userA: ${userA}, userB: ${userB}, limit: ${limit}`);
    const messages = await Message.getMessagesBetweenUsers(userAObjectId, userBObjectId, Number(limit));
    console.log('[API HANDLER] Messages fetched:', messages);
    
    return {
      success: true,
      data: messages.reverse() // reverse to show oldest first
    };
  } catch (error) {
    console.error('❌ [API HANDLER] Error fetching messages:', error);
    return {
      success: false,
      error: 'Failed to fetch messages'
    };
  }
});