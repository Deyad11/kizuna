"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  className?: string;
  text?: string;
}

export default function SignOutButton({ className, text = "sign out" }: Props) {
  const router = useRouter();
  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };
  return (
    <button className={className} onClick={signOut}>
      {text}
    </button>
  );
}
