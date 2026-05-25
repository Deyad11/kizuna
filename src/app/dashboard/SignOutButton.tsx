"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();

    // signOut() does three things:
    // 1. Calls Supabase's server to invalidate the refresh_token
    //    (so it cannot be used to generate new access tokens)
    // 2. Clears the auth cookies from the browser
    // 3. Updates the internal auth state to null
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      return;
    }

    // After sign out, redirect to home page.
    // router.refresh() forces Next.js to re-render server components
    // so they pick up the now-empty session.
    router.refresh();
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      style={{
        padding: "10px 20px",
        cursor: "pointer",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "4px",
      }}
    >
      Sign Out
    </button>
  );
}
