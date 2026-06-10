/**
 * Next.js 14 Server Component: app/blog/[slug]/page.tsx
 * Post Detail Page - content-driven monograph
 * ISR structured with 60 second revalidation window
 */
import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LexicalRenderer from '@/components/editor/LexicalRenderer';

export const revalidate = 60;

interface PostPageProps {
  params: {
    slug: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = params;
  const supabase = createClient();

  // Fetch target article by unique slug
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    return notFound();
  }

  // Fetch comments linked to this article
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', post.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-200 py-20 px-6 md:px-12">
      <article className="max-w-2xl mx-auto space-y-12">
        
        {/* Dynamic header row inside article */}
        <header className="space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs text-accent uppercase tracking-wider">ARTICLE / DETECTOR</span>
            <span className="text-zinc-700">|</span>
            <span className="font-mono text-xs text-zinc-500 uppercase">PUBLISHED RECORD</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 pt-3 pb-8 border-b border-zinc-900/60 text-xs font-mono text-zinc-500">
            <div>
              <p className="text-[10px] uppercase text-zinc-600 tracking-widest font-bold">DATE</p>
              <p className="mt-1 text-zinc-300">{new Date(post.created_at).toLocaleDateString().toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-600 tracking-widest font-bold">VIEWS</p>
              <p className="mt-1 text-zinc-300">{post.view_count || 0}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-600 tracking-widest font-bold">WRITTEN BY</p>
              <p className="mt-1 text-zinc-300">VANDULINUS</p>
            </div>
          </div>
        </header>

        {/* Lexical recursively parsed node tree (No dangerouslySetInnerHTML hack) */}
        <main className="prose prose-invert prose-stone max-w-none text-stone-300 leading-relaxed text-lg">
          <LexicalRenderer contentJson={post.content} />
        </main>

        {/* Editorial spacer */}
        <div className="h-[1px] bg-zinc-900 my-16" />

        {/* Response Center */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-sans font-semibold text-white tracking-tight">Responses</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              {comments?.length || 0}
            </span>
          </div>

          {/* Client side triggers and comment forms are set up in detail page container */}
        </section>
      </article>
    </div>
  );
}
