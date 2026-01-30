"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MissionControlHeader from "@/components/missions/MissionControlHeader";

export default function MissionsPage() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main className="px-14 py-6 space-y-6">
      <MissionControlHeader onLogout={handleLogout} />

      {/* Thick divider */}
      <div className="w-full border-b-5 border-black" />
    </main>
  );
}