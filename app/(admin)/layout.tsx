/**
 * Admin Route Group Layout: app/(admin)/layout.tsx
 * Guards admin routes — verifies authenticated Supabase session
 */
import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-stone-200">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
