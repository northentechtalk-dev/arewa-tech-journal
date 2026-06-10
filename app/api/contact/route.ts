import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { name, email, type, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
  }

  // Save the contact message
  const { error: msgError } = await supabase
    .from('contact_messages')
    .insert({ name, email, type: type || 'feedback', message });

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  // Create an admin notification
  const notifTitle = type === 'whistleblower'
    ? `🔴 WHISTLEBLOWER: ${name}`
    : `Tip from ${name} (${email})`;
  const notifType = type === 'whistleblower' ? 'whistleblower' : 'tip';

  await supabase.from('notifications').insert({
    title: notifTitle,
    message: `${type?.toUpperCase() || 'FEEDBACK'} • ${message.substring(0, 180)}`,
    type: notifType,
    read: false,
  });

  return NextResponse.json({
    success: true,
    message: 'Your editorial tip or enquiry was securely routed.',
  });
}
