import React from 'react';
import { User, MessageCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Comment } from '@/lib/types';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
}

export default function CommentList({ comments, isLoading }: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse-subtle">
        <div className="h-20 bg-zinc-900 rounded-xl" />
        <div className="h-24 bg-zinc-900 rounded-xl" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 border border-zinc-900 rounded-xl bg-zinc-950/20" id="empty-comments-state">
        <MessageCircle className="w-5 h-5 mx-auto text-zinc-600 mb-2" />
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          No records registered for this inquiry yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="comment-list-tracker">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2.5 shadow-xl hover:border-zinc-800/80 transition duration-150"
        >
          {/* Header row in sharp monospace layout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <User className="w-3 h-3 text-accent" />
              </div>
              <span className="text-xs font-mono font-semibold text-zinc-200">
                {comment.user_name}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 tracking-tight">
              {formatDate(comment.created_at)}
            </span>
          </div>

          {/* Comment Core Content */}
          <p className="text-sm text-zinc-300 font-sans leading-relaxed pl-1">
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  );
}
