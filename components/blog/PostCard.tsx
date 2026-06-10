import React from 'react';
import { Eye, Calendar, BookOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Post } from '@/lib/types';

interface PostCardProps {
  key?: React.Key;
  post: Post;
  onClick: (slug: string) => void;
}

// Map of high-fidelity developer-themed editorial illustrations
const FALLBACKS: Record<string, string> = {
  'crafting-the-invisible': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
  'dethroning-saas-dashboard': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  'unpublished-draft-checklist': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

export default function PostCard({ post, onClick }: PostCardProps) {
  // Resolve image URL
  const imageUrl = post.thumbnail_url || FALLBACKS[post.slug] || DEFAULT_IMAGE;

  return (
    <article
      onClick={() => onClick(post.slug)}
      className="group relative flex flex-col justify-between overflow-hidden bg-zinc-950 border border-zinc-900 rounded-xl cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:border-zinc-700/80 hover:shadow-xl hover:shadow-black/70"
      id={`post-card-${post.slug}`}
    >
      {/* Thumbnail Container */}
      <div className="relative w-full h-44 overflow-hidden border-b border-zinc-900/60 bg-zinc-900 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Subtle gradient overlay at the base */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-60" />
        
        {/* Hover overlay micro-indicator */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-zinc-950/90 border border-zinc-700/40 text-stone-300 font-mono text-[10px] tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xl scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
            <BookOpen className="w-3 h-3 text-accent" />
            <span>OPEN RECORD</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Date in crisp monospace */}
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 tracking-wider">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>{formatDate(post.created_at)}</span>
            </div>
            {post.status === 'draft' && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] uppercase tracking-widest">
                Draft
              </span>
            )}
          </div>

          {/* Category & Type badges */}
          {(post.category || post.type) && (
            <div className="flex flex-wrap gap-1.5">
              {post.category && (
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[9px] uppercase tracking-wider">
                  {post.category === 'events' ? 'activities & events' : post.category}
                </span>
              )}
              {post.type && (
                <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-900/60 text-zinc-450 font-mono text-[9px] uppercase tracking-wider">
                  {post.type}
                </span>
              )}
            </div>
          )}

          {/* Title: tight tracking, large */}
          <h3 className="text-lg font-sans font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors duration-150 line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt: 2-line clamp, muted */}
          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 pr-2 font-sans">
            {post.plain_text_excerpt || "Dive into this analytical inquiry exploring technical rhythms, typography choice, and interface craftsmanship."}
          </p>
        </div>

        {/* Footer view stats in monospace */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-900/40">
          <span className="text-[12px] font-mono text-accent hover:underline group-hover:text-accent-light transition duration-150">
            READ ARTICLE
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors duration-150">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.view_count || 0}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
