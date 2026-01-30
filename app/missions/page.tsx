"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import MissionControlHeader from "@/components/missions/MissionControlHeader";
import MissionCard from "@/components/missions/MissionCard";
import MissionModal from "@/components/missions/MissionModal";

function EmptySubSection({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black uppercase tracking-wide text-gray-700">
        {title}
      </h3>

      <div className="w-full border-2 border-dashed border-gray-300 py-10 flex items-center justify-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Nothing here yet
        </p>
      </div>
    </div>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black uppercase tracking-wide text-gray-700">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-black tracking-tight">{title}</h2>
      <div className="w-full border-b-2 border-black" />
    </div>
  );
}

export default function MissionsPage() {
  const router = useRouter();
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main className="px-14 pt-6 pb-20 space-y-12">
      <MissionControlHeader
        onNewMission={() => setIsMissionModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* ================= MY MISSIONS ================= */}
      <section className="space-y-8">
        <SectionHeader title="MY MISSIONS" />

        <SubSection title="ACTIVE">
          <MissionCard
            title="Launch New Product"
            status="ACTIVE"
            milestonesText="1 / 3 Milestones"
            dateRangeText="31/12/2025 - 31/03/2026"
            watchers={["A", "B"]}
          />
        </SubSection>

        <EmptySubSection title="COMPLETED" />
        <EmptySubSection title="UNSATISFIED" />
      </section>

      {/* ================= WATCHING ================= */}
      <section className="space-y-8">
        <SectionHeader title="WATCHING" />

        <SubSection title="ACTIVE">
          <MissionCard
            title="Team Project Alpha"
            status="ACTIVE"
            milestonesText="1 / 1 Milestones"
            dateRangeText="15/01/2026 - 16/03/2026"
            watchers={["B"]}
          />
        </SubSection>

        <EmptySubSection title="COMPLETED" />
        <EmptySubSection title="EXPIRED" />
      </section>

      {/* ================= CREATE MISSION MODAL ================= */}
      <MissionModal
        open={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        onCreate={(payload) => {
          // For now just confirm the wiring works:
          console.log("CREATE MISSION:", payload);
          // Next step: insert into Supabase missions table.
        }}
      />
    </main>
  );
}