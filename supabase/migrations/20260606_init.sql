-- SQL Migration: Blog Schema with RLS and View Counter RPC

-- Create custom enum status type if it doesn't exist
CREATE TYPE post_status AS ENUM ('draft', 'published');

-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL, -- Stores serialized Lexical EditorState
  plain_text_excerpt TEXT,
  status post_status DEFAULT 'draft'::post_status,
  view_count INT DEFAULT 0,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Post RLS Policies
-- Anon role: SELECT only where status = 'published'
CREATE POLICY "Allow anonymous read of published posts" 
ON posts 
FOR SELECT 
TO anon 
USING (status = 'published');

-- Authenticated role: full INSERT, UPDATE, DELETE where auth.uid() = author_id
CREATE POLICY "Allow authors to manage their own posts" 
ON posts 
FOR ALL 
TO authenticated 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);


-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Comment RLS Policies
-- Anon role: SELECT all, INSERT only (no UPDATE, no DELETE)
CREATE POLICY "Allow anonymous to read all comments" 
ON comments 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow anonymous to create comments" 
ON comments 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Authenticated role: DELETE (for admin moderation)
CREATE POLICY "Allow authenticated admins to moderating comments" 
ON comments 
FOR DELETE 
TO authenticated 
USING (true);


-- Create RPC function to increment view counter
CREATE OR REPLACE FUNCTION increment_view_count(post_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET view_count = view_count + 1 
  WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
