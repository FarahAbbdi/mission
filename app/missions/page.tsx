"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MissionControlHeader from "@/components/missions/MissionControlHeader";
import MissionCard from "@/components/missions/MissionCard";

function EmptySubSection({ title }: { title: string }) {
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
    <main className="px-14 pt-6 pb-20 space-y-10">
      <MissionControlHeader onLogout={handleLogout} />

      {/* Thick divider */}
      <div className="w-full border-b-4 border-black" />

      {/* ================= MY MISSIONS ================= */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black tracking-tight">
          MY MISSIONS
        </h2>

        <div className="w-full border-b-2 border-black" />

        {/* ACTIVE */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-wide text-gray-700">
            ACTIVE
          </h3>

          <MissionCard
            title="Launch New Product"
            status="ACTIVE"
            milestonesText="1 / 3 Milestones"
            dateRangeText="31/12/2025 - 31/03/2026"
            watchers={["A", "B"]}
          />
        </div>

        <EmptySubSection title="COMPLETED" />
        <EmptySubSection title="UNSATISFIED" />
      </section>

      {/* ================= WATCHING ================= */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black tracking-tight">
          WATCHING
        </h2>

        <div className="w-full border-b-2 border-black" />

        {/* ACTIVE */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-wide text-gray-700">
            ACTIVE
          </h3>

          <MissionCard
            title="Team Project Alpha"
            status="ACTIVE"
            milestonesText="1 / 1 Milestones"
            dateRangeText="15/01/2026 - 16/03/2026"
            watchers={["B"]}
          />
        </div>

        <EmptySubSection title="COMPLETED" />
        <EmptySubSection title="EXPIRED" />
      </section>
    </main>
  );
}