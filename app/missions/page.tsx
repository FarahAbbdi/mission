"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import MissionControlHeader from "@/components/missions/MissionControlHeader";
import MissionCard from "@/components/missions/MissionCard";
import MissionModal from "@/components/missions/MissionModal";

type CreateMissionPayload = {
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  description?: string;
};

// DB status values are lowercase in your table checks
type MissionStatus = "active" | "completed" | "expired";

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
    console.group("[logout]");
    console.log("start");
    const { error } = await supabase.auth.signOut();
    if (error) console.error("error:", error);
    console.log("done -> push /");
    console.groupEnd();

    router.push("/");
  }

  async function handleCreateMission(payload: CreateMissionPayload) {
    console.group("[createMission]");
    console.log("payload from modal:", payload);

    // Confirm session + user
    const sessionRes = await supabase.auth.getSession();
    console.log("session:", sessionRes.data.session);

    const userRes = await supabase.auth.getUser();
    console.log("getUser response:", userRes);

    const user = userRes.data.user;
    if (!user) {
      console.error("NO USER - not logged in");
      console.groupEnd();
      throw new Error("You must be logged in to create a mission.");
    }

    // Build row matching your DB schema
    const row: {
      owner_id: string;
      name: string;
      description: string | null;
      start_date: string;
      end_date: string;
      status: MissionStatus;
    } = {
      owner_id: user.id,
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      start_date: payload.startDate,
      end_date: payload.endDate,
      status: "active",
    };

    console.log("inserting row -> public.missions:", row);

    // Insert + return inserted row for debugging
    const insertRes = await supabase
      .from("missions")
      .insert(row)
      .select("id, owner_id, name, status, start_date, end_date, created_at")
      .single();

    console.log("insert response:", insertRes);

    if (insertRes.error) {
      console.error("insert error details:", {
        message: insertRes.error.message,
        code: (insertRes.error as any).code,
        details: (insertRes.error as any).details,
        hint: (insertRes.error as any).hint,
      });
      console.groupEnd();
      throw new Error(insertRes.error.message);
    }

    console.log("inserted mission:", insertRes.data);
    console.groupEnd();

    setIsMissionModalOpen(false);

    // Next step later: load missions from DB and refresh list here.
  }

  return (
    <main className="px-10 pt-5 pb-16 space-y-10">
      <MissionControlHeader
        onNewMission={() => {
          console.log("[ui] NEW MISSION click -> open modal");
          setIsMissionModalOpen(true);
        }}
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

        <EmptySubSection title="COMPLETED" />
        <EmptySubSection title="UNSATISFIED" />
      </section>

      {/* ================= CREATE MISSION MODAL ================= */}
      <MissionModal
        open={isMissionModalOpen}
        onClose={() => {
          console.log("[ui] modal close");
          setIsMissionModalOpen(false);
        }}
        onCreate={handleCreateMission}
      />
    </main>
  );
}