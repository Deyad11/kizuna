"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function AuthListener() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Get the current user when component mounts
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // onAuthStateChange fires whenever:
    // - User signs in
    // - User signs out
    // - Token is refreshed
    // - Session expires
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      // event can be: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED,
      //               USER_UPDATED, PASSWORD_RECOVERY, INITIAL_SESSION

      setUser(session?.user ?? null);
    });

    // Clean up the subscription when component unmounts
    // If you skip this, you get memory leaks
    return () => subscription.unsubscribe();
  }, []);

  return <div>{user ? `Logged in as: ${user.email}` : "Not logged in"}</div>;
}
