/**
 * Next.js 14 App Router Admin Layout: app/(admin)/layout.tsx
 * Guards the administration routes; verifies valid author session cookies
 */
import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = createClient();
  
  // Verify user has active session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    // Force secure route redirection if session is not active
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-stone-200">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
