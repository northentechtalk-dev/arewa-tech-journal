/**
 * Next.js 14 Route Handler: /api/views
 * Calls the Supabase RPC "increment_view_count" without auth limits
 */
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    
    if (!slug) {
      return NextResponse.json({ error: 'Missing parameter: slug' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Call the database function to increment view counts atomicly
    const { error } = await supabase.rpc('increment_view_count', {
      post_slug: slug,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
