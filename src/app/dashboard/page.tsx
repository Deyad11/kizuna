// Server component — runs on the server, has direct access to auth session
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "./SignOutButton";

export default async function Dashboard() {
  const supabase = await createClient();

  // Verify the user is authenticated server-side.
  // Even though middleware already checked this, always verify again
  // in your actual page — defense in depth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If somehow they got here without being logged in, redirect them
  if (!user) {
    redirect("/");
  }

  // user object structure:
  // {
  //   id: "uuid-string",           ← Supabase user ID
  //   email: "user@gmail.com",
  //   created_at: "2026-05-25...",
  //   user_metadata: {
  //     avatar_url: "https://...", ← Google profile picture
  //     email: "user@gmail.com",
  //     email_verified: true,
  //     full_name: "Hardik Sati",  ← Name from Google
  //     name: "Hardik Sati",
  //     picture: "https://...",    ← Same as avatar_url
  //     sub: "1234567890"          ← Google's internal user ID
  //   },
  //   app_metadata: {
  //     provider: "google",
  //     providers: ["google"]
  //   }
  // }

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>絆 Kizuna — Dashboard</h1>
      <p>You are logged in.</p>

      <div
        style={{
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <h2>Your User Data</h2>
        <p>
          <strong>User ID:</strong> {user.id}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Name:</strong>{" "}
          {user.user_metadata?.full_name ?? "Not provided"}
        </p>
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            style={{ width: 60, height: 60, borderRadius: "50%" }}
          />
        )}
      </div>

      <div
        style={{
          background: "#f0f8ff",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <h2>Raw User Object (for debugging)</h2>
        <pre style={{ fontSize: "12px", overflowX: "auto" }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <SignOutButton />
    </main>
  );
}
