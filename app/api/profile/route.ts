import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  const body = await request.json();
  const { username, full_name, avatar_url, bio, two_factor_enabled, ip_whitelist } = body;

  const updates: Record<string, unknown> = { id: user.id };
  if (username !== undefined) updates.username = username;
  if (full_name !== undefined) updates.full_name = full_name;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;
  if (bio !== undefined) updates.bio = bio;
  if (two_factor_enabled !== undefined) updates.two_factor_enabled = !!two_factor_enabled;
  if (ip_whitelist !== undefined) updates.ip_whitelist = ip_whitelist;
  updates.last_login = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .upsert(updates)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, profile: data });
}
