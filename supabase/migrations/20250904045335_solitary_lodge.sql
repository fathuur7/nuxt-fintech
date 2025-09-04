/*
  # Create helper functions for conversations

  1. Functions
    - get_user_conversations - Get conversations for a user
    - mark_conversation_read - Mark all messages in conversation as read

  2. Purpose
    - Provide efficient queries for chat functionality
    - Handle complex conversation logic in database
*/

-- Function to get user conversations with latest message and unread count
CREATE OR REPLACE FUNCTION get_user_conversations(user_uuid uuid)
RETURNS TABLE (
  other_user_id uuid,
  other_user_username text,
  other_user_email text,
  other_user_avatar_url text,
  last_message_id uuid,
  last_message_content text,
  last_message_created_at timestamptz,
  unread_count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH conversation_messages AS (
    SELECT 
      m.*,
      CASE 
        WHEN m.sender_id = user_uuid THEN m.receiver_id
        ELSE m.sender_id
      END as other_user_id,
      ROW_NUMBER() OVER (
        PARTITION BY 
          CASE 
            WHEN m.sender_id = user_uuid THEN m.receiver_id
            ELSE m.sender_id
          END
        ORDER BY m.created_at DESC
      ) as rn
    FROM messages m
    WHERE m.sender_id = user_uuid OR m.receiver_id = user_uuid
  ),
  latest_messages AS (
    SELECT * FROM conversation_messages WHERE rn = 1
  ),
  unread_counts AS (
    SELECT 
      m.sender_id as other_user_id,
      COUNT(*) as unread_count
    FROM messages m
    WHERE m.receiver_id = user_uuid AND m.is_read = false
    GROUP BY m.sender_id
  )
  SELECT 
    lm.other_user_id,
    u.username,
    u.email,
    u.avatar_url,
    lm.id,
    lm.content,
    lm.created_at,
    COALESCE(uc.unread_count, 0)
  FROM latest_messages lm
  JOIN users u ON u.id = lm.other_user_id
  LEFT JOIN unread_counts uc ON uc.other_user_id = lm.other_user_id
  ORDER BY lm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all messages in a conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(sender_uuid uuid, receiver_uuid uuid)
RETURNS integer AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE messages 
  SET 
    is_read = true,
    read_at = now(),
    status = 'read'
  WHERE 
    sender_id = sender_uuid 
    AND receiver_id = receiver_uuid 
    AND is_read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;