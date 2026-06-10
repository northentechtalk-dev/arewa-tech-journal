import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const fields = ['title', 'slug', 'content', 'plain_text_excerpt', 'thumbnail_url', 'status', 'category', 'type', 'scheduled_at'];
  for (const field of fields) {
    if (body[field] !== undefined) {
      updates[field] = field === 'slug'
        ? body[field].trim().toLowerCase().replace(/\s+/g, '-')
        : body[field];
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .eq('author_id', user.id) // RLS: owner only
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
