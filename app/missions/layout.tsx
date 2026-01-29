"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function MissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function guard() {
      const { data } = await supabase.auth.getSession();
      if (mounted && !data.session) router.replace("/");
    }

    guard();

    return () => {
      mounted = false;
    };
  }, [router]);

  return <>{children}</>;
}