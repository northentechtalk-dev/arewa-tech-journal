import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const includeDrafts = searchParams.get('includeDrafts') === 'true';

  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (!includeDrafts || !user) {
    query = query.eq('status', 'published');
    // Exclude future-scheduled posts
    query = query.or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  const body = await request.json();
  const { title, slug, content, plain_text_excerpt, status, thumbnail_url, category, type, scheduled_at } = body;

  if (!title || !slug || !content) {
    return NextResponse.json({ error: 'Missing required fields: title, slug, content' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title,
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      content,
      plain_text_excerpt: plain_text_excerpt || '',
      thumbnail_url: thumbnail_url || null,
      status: status || 'draft',
      category: category || 'highlights',
      type: type || 'article',
      scheduled_at: scheduled_at || null,
      author_id: user.id,
      view_count: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
