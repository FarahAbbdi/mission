"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MissionControlHeader from "@/components/missions/MissionControlHeader";

function SubSection({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black uppercase tracking-wide text-gray-700">
        {title}
      </h3>

      <div className="w-full border-2 border-dashed border-gray-300 py-14 flex items-center justify-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Nothing here yet
        </p>
      </div>
    </div>
  );
}

export default function MissionsPage() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main className="px-14 py-6 space-y-10">
      <MissionControlHeader onLogout={handleLogout} />

      {/* Thick divider */}
      <div className="w-full border-b-4 border-black" />

      {/* ================= MY MISSIONS ================= */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black tracking-tight">
          MY MISSIONS
        </h2>

        <div className="w-full border-b-2 border-black" />

        <SubSection title="ACTIVE" />
        <SubSection title="COMPLETED" />
        <SubSection title="UNSATISFIED" />
      </section>

      {/* ================= WATCHING ================= */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black tracking-tight">
          WATCHING
        </h2>

        <div className="w-full border-b-2 border-black" />

        <SubSection title="ACTIVE" />
        <SubSection title="COMPLETED" />
        <SubSection title="EXPIRED" />
      </section>
    </main>
  );
}