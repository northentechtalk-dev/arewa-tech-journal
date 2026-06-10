-- SQL Migration: Extend Blog Schema for full feature parity
-- Run this in your Supabase project SQL editor after the initial 20260606_init.sql

-- Add missing columns to posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'highlights',
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'article',
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Profile table (replaces hardcoded admin in Express server.ts)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  two_factor_enabled BOOLEAN DEFAULT false,
  ip_whitelist TEXT DEFAULT '0.0.0.0/0',
  last_login TIMESTAMPTZ DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'tip',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT DEFAULT 'feedback',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: profiles — owner only
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_profile_all"
  ON profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS: notifications — authenticated admins only
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_notifications_all"
  ON notifications FOR ALL TO authenticated USING (true);

-- RLS: contact_messages — anyone can insert, authenticated can read
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_contact"
  ON contact_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_read_contact"
  ON contact_messages FOR SELECT TO authenticated USING (true);

-- Storage: Create thumbnails bucket (run separately in Storage dashboard or via API)
-- Bucket name: thumbnails
-- Public: true
-- Storage RLS policies for thumbnails bucket:
--   SELECT: to everyone (public)
--   INSERT: to authenticated users only
