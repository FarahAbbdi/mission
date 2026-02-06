"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import MissionControlHeader from "@/components/missions/MissionControlHeader";
import MissionCard from "@/components/missions/MissionCard";
import MissionModal from "@/components/missions/MissionModal";

type MissionStatus = "ACTIVE" | "COMPLETED" | "UNSATISFIED";

type MissionRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  start_date: string; // YYYY-MM-DD from Supabase (date column)
  end_date: string; // YYYY-MM-DD
  status: MissionStatus;
  created_at: string;
  updated_at: string;
};

type CreateMissionPayload = {
  name: string;
  startDate: string; // must be YYYY-MM-DD
  endDate: string; // must be YYYY-MM-DD
  description?: string;
};

function EmptySubSection({ title }: { title: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-black uppercase tracking-wide text-gray-700">
        {title}
      </h3>

      <div className="w-full border-2 border-dashed border-gray-300 py-10 min-h-[220px] flex items-center justify-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Nothing here yet
        </p>
      </div>
    </div>
  );
}

/** Use when the subsection title is already shown, to avoid repeating “ACTIVE” twice */
function EmptyPlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full border-2 border-dashed border-gray-300 py-10 min-h-[220px] flex items-center justify-center">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </p>
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

function formatDateRange(start: string, end: string) {
  // input: "YYYY-MM-DD"
  const toDMY = (d: string) => {
    const [y, m, day] = d.split("-");
    if (!y || !m || !day) return d;
    return `${day}/${m}/${y}`;
  };

  return `${toDMY(start)} - ${toDMY(end)}`;
}

const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export default function MissionsPage() {
  const router = useRouter();

  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);

  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const loadMissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      setError(userErr.message);
      setMissions([]);
      setLoading(false);
      return;
    }

    if (!user) {
      setMissions([]);
      setLoading(false);
      return;
    }

    const { data, error: fetchErr } = await supabase
      .from("missions")
      .select(
        "id, owner_id, name, description, start_date, end_date, status, created_at, updated_at"
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchErr) {
      console.error("loadMissions error:", fetchErr);
      setError(`${fetchErr.code ?? ""} ${fetchErr.message}`.trim());
      setMissions([]);
      setLoading(false);
      return;
    }

    setMissions((data ?? []) as MissionRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // defer to a microtask so loadMissions (which calls setState) doesn't run synchronously
    void Promise.resolve().then(() => loadMissions());
  }, [loadMissions]);

  const active = useMemo(
    () => missions.filter((m) => m.status === "ACTIVE"),
    [missions]
  );
  const completed = useMemo(
    () => missions.filter((m) => m.status === "COMPLETED"),
    [missions]
  );
  const unsatisfied = useMemo(
    () => missions.filter((m) => m.status === "UNSATISFIED"),
    [missions]
  );

  async function handleCreateMission(payload: CreateMissionPayload) {
    setError(null);

    const name = payload.name.trim();
    if (!name) {
      setError("Mission name is required.");
      return;
    }

    if (!isISODate(payload.startDate) || !isISODate(payload.endDate)) {
      setError("Dates must be in YYYY-MM-DD format.");
      return;
    }

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      setError(userErr.message);
      return;
    }

    if (!user) {
      setError("You must be logged in to create a mission.");
      return;
    }

    // Insert and RETURN the inserted row so you can confirm it truly saved.
    const { data: inserted, error: insertErr } = await supabase
      .from("missions")
      .insert({
        owner_id: user.id,
        name,
        description: payload.description?.trim() || null,
        start_date: payload.startDate,
        end_date: payload.endDate,
        status: "ACTIVE",
      })
      .select(
        "id, owner_id, name, description, start_date, end_date, status, created_at, updated_at"
      )
      .single();

    if (insertErr) {
      console.error("createMission error:", insertErr);
      setError(`${insertErr.code ?? ""} ${insertErr.message}`.trim());
      return;
    }

    // Optimistically show it immediately
    if (inserted) setMissions((prev) => [inserted as MissionRow, ...prev]);

    setIsMissionModalOpen(false);

    // Optional: re-fetch to guarantee sync (kept for safety)
    await loadMissions();
  }

  return (
    <main className="px-10 pt-5 pb-16 space-y-10">
      <MissionControlHeader
        onNewMission={() => setIsMissionModalOpen(true)}
        onLogout={handleLogout}
      />

      {error && (
        <div className="text-xs font-semibold uppercase tracking-widest text-red-600">
          {error}
        </div>
      )}

      {/* ================= MY MISSIONS ================= */}
      <section className="space-y-6">
        <SectionHeader title="MY MISSIONS" />

        <SubSection title="ACTIVE">
          {loading ? (
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Loading…
            </div>
          ) : active.length ? (
            <MissionGrid>
              {active.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status="ACTIVE"
                  milestonesText="0 / 0 Milestones"
                  dateRangeText={formatDateRange(m.start_date, m.end_date)}
                  watchers={[]}
                />
              ))}
            </MissionGrid>
          ) : (
            <EmptyPlaceholder label="Nothing here yet" />
          )}
        </SubSection>

        {completed.length ? (
          <SubSection title="COMPLETED">
            <MissionGrid>
              {completed.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status="COMPLETED"
                  milestonesText="0 / 0 Milestones"
                  dateRangeText={formatDateRange(m.start_date, m.end_date)}
                  watchers={[]}
                />
              ))}
            </MissionGrid>
          </SubSection>
        ) : (
          <EmptySubSection title="COMPLETED" />
        )}

        {unsatisfied.length ? (
          <SubSection title="UNSATISFIED">
            <MissionGrid>
              {unsatisfied.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status="UNSATISFIED"
                  milestonesText="0 / 0 Milestones"
                  dateRangeText={formatDateRange(m.start_date, m.end_date)}
                  watchers={[]}
                />
              ))}
            </MissionGrid>
          </SubSection>
        ) : (
          <EmptySubSection title="UNSATISFIED" />
        )}
      </section>

      {/* ================= WATCHING ================= */}
      <section className="space-y-6">
        <SectionHeader title="WATCHING" />
        <EmptySubSection title="ACTIVE" />
        <EmptySubSection title="COMPLETED" />
        <EmptySubSection title="UNSATISFIED" />
      </section>

      {/* ================= CREATE MISSION MODAL ================= */}
      <MissionModal
        open={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        onCreate={handleCreateMission}
      />
    </main>
  );
}