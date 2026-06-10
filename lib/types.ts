// Type definitions for the Editor-led Editorial Blog

export type PostStatus = 'draft' | 'published';

export interface Post {
  id: string; // UUID
  title: string;
  slug: string;
  content: any; // Serialized Lexical EditorState (JSONB)
  plain_text_excerpt: string;
  thumbnail_url?: string;
  status: PostStatus;
  view_count: number;
  author_id: string;
  category?: 'highlights' | 'opinion' | 'stars' | 'events' | string;
  type?: 'article' | 'event' | 'profile' | 'editorial' | string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
    };
  } | null;
}
