import React, { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

interface CommentFormProps {
  postId: string;
  onSuccess: () => void;
}

export default function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const [userName, setUserName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !content.trim()) {
      setErrorMsg('Both fields are mandatory to record a feedback session.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          user_name: userName.trim(),
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }

      // Success
      setUserName('');
      setContent('');
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4 shadow-xl" id="comment-form-container">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-accent" />
        <span className="text-[11px] font-mono font-medium text-zinc-100 uppercase tracking-widest">SUBMIT RESPONSE</span>
      </div>

      <div className="space-y-1">
        <label htmlFor="user_name" className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          NAME / IDENTITY / ALIAS
        </label>
        <input
          type="text"
          id="user_name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="guillermo_r"
          className="w-full bg-zinc-900 border border-zinc-700/65 rounded-lg px-4 py-2.5 text-zinc-100 text-sm outline-none transition focus:border-accent"
          maxLength={100}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          COMMENTARY / REACTION
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="I appreciate the deliberate restraint when styling the line-height coefficients..."
          rows={4}
          className="w-full bg-zinc-900 border border-zinc-700/65 rounded-lg px-4 py-2.5 text-zinc-100 text-sm outline-none transition focus:border-accent resize-y"
          maxLength={1000}
        />
      </div>

      {errorMsg && (
        <p className="text-xs text-red-400 font-mono" id="validation-error">
          * {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 bg-zinc-900/40 hover:bg-zinc-800/80 hover:text-white border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-mono text-xs font-semibold px-4 py-2.5 rounded-lg shadow transition duration-150 disabled:opacity-50 select-none cursor-pointer w-full"
        id="btn-comment-submit"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            <span>RECORDING...</span>
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            <span>RECORD RESPONSE</span>
          </>
        )}
      </button>
    </form>
  );
}
