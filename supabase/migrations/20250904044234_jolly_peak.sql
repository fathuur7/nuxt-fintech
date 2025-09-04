/*
  # Create messages table for real-time chat

  1. New Tables
    - `messages` - Chat messages between users
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references users)
      - `receiver_id` (uuid, references users)
      - `content` (text)
      - `message_type` (text, default 'text')
      - `status` (text, default 'sent')
      - `is_read` (boolean, default false)
      - `read_at` (timestamp, nullable)
      - `attachment_url` (text, nullable)
      - `attachment_type` (text, nullable)
      - `attachment_size` (integer, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `messages` table
    - Add policies for users to read their own messages
    - Add policies for users to send messages
    - Add policy for admins to read all messages

  3. Indexes
    - Create indexes for better query performance
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  is_read boolean DEFAULT false,
  read_at timestamptz,
  attachment_url text,
  attachment_type text,
  attachment_size integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Policy for admins to read all messages
CREATE POLICY "Admins can read all messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS messages_sender_receiver_idx ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_receiver_unread_idx ON messages(receiver_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(
  LEAST(sender_id, receiver_id), 
  GREATEST(sender_id, receiver_id), 
  created_at DESC
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();