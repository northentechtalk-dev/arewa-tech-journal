/**
 * Next.js 14 Route Handler: /api/comments
 * Creates new post comments (Open endpoint)
 */
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { post_id, user_name, content } = await request.json();

    if (!post_id || !user_name || !content) {
      return NextResponse.json({ error: 'Missing parameter names or body content.' }, { status: 400 });
    }

    /*
     * RATE LIMITING AWARENESS (PRODUCTION NOTE):
     *
     * To protect comment creation from spam or bot attacks without auth, enforce a Redis token bucket limiter:
     *
     * import { Redis } from '@upstash/redis';
     * import { Ratelimit } from '@upstash/ratelimit';
     *
     * const ip = request.headers.get('x-forwarded-for') || 'anonymous';
     * const ratelimit = new Ratelimit({
     *   redis: Redis.fromEnv(),
     *   limiter: Ratelimit.slidingWindow(5, '10 s'),
     * });
     * const { success } = await ratelimit.limit(`comments_${ip}`);
     * if (!success) return NextResponse.json({ error: 'Too many comments. Calm down!' }, { status: 429 });
     */

    const supabase = createClient();
    
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id,
        user_name,
        content
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
