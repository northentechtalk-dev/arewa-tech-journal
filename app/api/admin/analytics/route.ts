import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  // Aggregate stats from posts, comments, notifications
  const [postsRes, commentsRes, notifRes] = await Promise.all([
    supabase.from('posts').select('status, category, view_count'),
    supabase.from('comments').select('id', { count: 'exact', head: true }),
    supabase.from('notifications').select('read'),
  ]);

  const posts = postsRes.data ?? [];
  const totalComments = commentsRes.count ?? 0;
  const notifications = notifRes.data ?? [];

  const published = posts.filter((p: any) => p.status === 'published');
  const drafts = posts.filter((p: any) => p.status === 'draft');
  const totalViews = posts.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0);

  const categories = posts.reduce((acc: Record<string, number>, p: any) => {
    const cat = p.category || 'highlights';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, { highlights: 0, opinion: 0, stars: 0, events: 0 });

  const unreadNotifications = notifications.filter((n: any) => !n.read).length;

  return NextResponse.json({
    total_blogs: posts.length,
    published_blogs: published.length,
    draft_blogs: drafts.length,
    total_views: totalViews,
    total_comments: totalComments,
    unread_notifications: unreadNotifications,
    total_users: Math.round(totalViews * 0.7), // estimated unique visitors
    estimated_shares: Math.round(totalViews * 0.12) + 2,
    categories,
  });
}
