/**
 * Next.js 15 Server Component: app/blog/[slug]/page.tsx
 * Post detail page — fetches from Supabase, increments view count, renders with LexicalRenderer
 */
import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LexicalRenderer from '@/components/editor/LexicalRenderer';
import type { Metadata } from 'next';

export const revalidate = 60;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('title, plain_text_excerpt').eq('slug', slug).single();
  return {
    title: post?.title ?? slug,
    description: post?.plain_text_excerpt ?? undefined,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !post) return notFound();

  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', post.id)
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-200 py-20 px-6 md:px-12">
      <article className="max-w-2xl mx-auto space-y-12">

        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">AREWA JOURNAL READING</span>
            <span className="text-zinc-800">|</span>
            <span className="font-mono text-xs text-zinc-500 uppercase opacity-90">TAG: {post.category || 'highlights'}</span>
            <span className="text-zinc-800">|</span>
            <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 font-mono text-[9px] uppercase tracking-wider">{post.type || 'article'}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 pt-3 pb-8 border-b border-zinc-900/60 text-xs font-mono text-zinc-500">
            <div>
              <p className="text-[10px] uppercase text-zinc-600 tracking-widest font-bold">DATE</p>
              <p className="mt-1 text-zinc-300">{new Date(post.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-600 tracking-widest font-bold">VIEWS</p>
              <p className="mt-1 text-zinc-300">{post.view_count || 0}</p>
            </div>
          </div>
        </header>

        {post.thumbnail_url && (
          <div className="w-full h-64 md:h-80 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <main className="prose prose-invert max-w-none text-zinc-200 space-y-4 text-justify">
          <LexicalRenderer content={post.content} />
        </main>

        <div className="h-[1px] bg-zinc-900 my-16" />

        <section className="space-y-8 pb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-sans font-semibold text-white tracking-tight">Ecosystem Dialogue</h2>
            <span className="text-xs font-mono text-zinc-500">{comments?.length ?? 0} contributions</span>
          </div>
          <p className="text-xs font-mono text-zinc-500">
            Use the main site to leave a comment on this article.
          </p>
        </section>
      </article>
    </div>
  );
}
