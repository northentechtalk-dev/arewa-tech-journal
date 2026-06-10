/**
 * Next.js 14 Server Component: app/(public)/page.tsx
 * Public Homepage - CURATED READING LIST
 * ISR configured with 60 second revalidation window
 */
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PostCard from '@/components/blog/PostCard';

// Force Incremental Static Regeneration interval
export const revalidate = 60;

export default async function Homepage() {
  const supabase = createClient();
  
  // Fetch published articles
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching curated catalog:', error);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-200 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Editorial Minimal Header */}
        <header className="space-y-4 text-left border-b border-zinc-900 pb-12">
          <div className="inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse-subtle" />
            <span className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
              CRAFT CHRONICLES
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-white max-w-2xl leading-none">
            Inquiries into code, spacing, and software composition.
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-xl font-sans leading-relaxed">
            A developer journal on physical monospace layout structures, typography hierarchy, and deliberate visual design.
          </p>
        </header>

        {/* Post Grid (2-col on md, 3-col on lg) */}
        <main className="space-y-8">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-widest">
              CURATED COLLECTION
            </span>
            <div className="h-[1px] bg-zinc-900 flex-1" />
          </div>

          {!posts || posts.length === 0 ? (
            <div className="py-24 text-center border border-zinc-900 rounded-xl bg-zinc-950/20">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Curated collection currently empty.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  // In real Next.js environment, handle clicking via Router hooks
                  onClick={() => {}} 
                />
              ))}
            </div>
          )}
        </main>

        {/* Editorial Footer */}
        <footer className="pt-16 border-t border-zinc-900 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono text-zinc-500">
            © 2026 JOURNAL. ALL MATERIAL CURATED.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="hover:text-zinc-300 transition cursor-pointer">RSS FEED</span>
            <span>/</span>
            <span className="hover:text-zinc-300 transition cursor-pointer">API RECOGNITION</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
