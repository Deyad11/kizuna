'use client';

import { createClient } from '@/lib/supabase/client';

interface Props {
  className?: string;
  text?: string;
  next?: string;
}

export default function SignInButton({
  className,
  text = "Continue with Google",
  next = '/',
}: Props) {

  const signIn = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <button className={className} onClick={signIn}>
      {text}
      <span aria-hidden>→</span>
    </button>
  );
}
