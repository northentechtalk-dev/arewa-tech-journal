import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('post_id');

  let query = supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: true });

  if (postId) {
    query = query.eq('post_id', postId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { post_id, user_name, content } = body;

  if (!post_id || !user_name || !content) {
    return NextResponse.json({ error: 'Missing required fields: post_id, user_name, content' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id, user_name, content })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
