/**
 * Next.js 14 Route Handler: /api/posts
 * Handles post collection reading (GET) and creating (POST)
 */
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(posts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Auth Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, plain_text_excerpt, status } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required parameters: title, slug, content' }, { status: 400 });
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        slug,
        content,
        plain_text_excerpt,
        status: status || 'draft',
        author_id: session.user.id,
        view_count: 0,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(post, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
