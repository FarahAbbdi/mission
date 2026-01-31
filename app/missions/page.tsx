"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import MissionControlHeader from "@/components/missions/MissionControlHeader";
import MissionCard from "@/components/missions/MissionCard";
import MissionModal from "@/components/missions/MissionModal";

function EmptySubSection({ title }: { title: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-black uppercase tracking-wide text-gray-700">
        {title}
      </h3>

      <div className="w-full border-2 border-dashed border-gray-300 py-10 min-h-[120px] flex items-center justify-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
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
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-wide text-gray-700">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="space-y-3">
      <h2 className="text-3xl font-black tracking-tight">{title}</h2>
      <div className="w-full border-b-2 border-black" />
    </div>
  );
}

function MissionGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {children}
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
    <main className="px-10 pt-5 pb-16 space-y-10">
      <MissionControlHeader
        onNewMission={() => setIsMissionModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* ================= MY MISSIONS ================= */}
      <section className="space-y-6">
        <SectionHeader title="MY MISSIONS" />

        <SubSection title="ACTIVE">
          <MissionGrid>
            <MissionCard
              title="Launch New Product"
              status="ACTIVE"
              milestonesText="1 / 3 Milestones"
              dateRangeText="31/12/2025 - 31/03/2026"
              watchers={["A", "B"]}
            />

            <MissionCard
              title="Launch New Product"
              status="ACTIVE"
              milestonesText="1 / 3 Milestones"
              dateRangeText="31/12/2025 - 31/03/2026"
              watchers={["A", "B"]}
            />

            <MissionCard
              title="Launch New Product"
              status="ACTIVE"
              milestonesText="1 / 3 Milestones"
              dateRangeText="31/12/2025 - 31/03/2026"
              watchers={["A", "B"]}
            />
          </MissionGrid>
          
        </SubSection>

        <EmptySubSection title="COMPLETED" />
        <EmptySubSection title="UNSATISFIED" />
      </section>

      {/* ================= WATCHING ================= */}
      <section className="space-y-6">
        <SectionHeader title="WATCHING" />

        <SubSection title="ACTIVE">
          <MissionGrid>
            {Array.from({ length: 8 }).map((_, i) => (
              <MissionCard
                key={i}
                title={`Mission ${i + 1}`}
                status="ACTIVE"
                milestonesText="1 / 3 Milestones"
                dateRangeText="31/12/2025 - 31/03/2026"
                watchers={["A", "B"]}
              />
            ))}
          </MissionGrid>
        </SubSection>
      </section>

      {/* ================= CREATE MISSION MODAL ================= */}
      <MissionModal
        open={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        onCreate={(payload) => {
          console.log("CREATE MISSION:", payload);
        }}
      />
    </main>
  );
}