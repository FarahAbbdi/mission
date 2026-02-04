"use client";

import { useEffect, useMemo, useState } from "react";
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

type MissionRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: MissionStatus;
  created_at: string;
  updated_at: string;
};

function todayISODate(): string {
  // YYYY-MM-DD (in local time, stable for date comparisons with Supabase "date" column)
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function EmptyPlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full border-2 border-dashed border-gray-300 py-10 min-h-[220px] flex items-center justify-center bg-white">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 text-center">
        {label}
      </p>
    </div>
  );
}

function EmptySubSection({ title, label }: { title: string; label: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-black uppercase tracking-wide text-gray-700">
        {title}
      </h3>
      <EmptyPlaceholder label={label} />
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
  // "YYYY-MM-DD" -> "DD/MM/YYYY"
  const toDMY = (d: string) => {
    const [y, m, day] = d.split("-");
    if (!y || !m || !day) return d;
    return `${day}/${m}/${y}`;
  };
  return `${toDMY(start)} - ${toDMY(end)}`;
}

function toCardStatus(
  status: MissionStatus
): "ACTIVE" | "COMPLETED" | "EXPIRED" {
  if (status === "completed") return "COMPLETED";
  if (status === "expired") return "EXPIRED";
  return "ACTIVE";
}

function FullPageLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-white/70">
      <div className="h-full w-full grid place-items-center">
        <div className="border-2 border-black bg-white px-6 py-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-700">
            Loading…
          </div>
          <div className="mt-2 h-[2px] w-24 bg-black" />
        </div>
      </div>
    </div>
  );
}

export default function MissionsPage() {
  const router = useRouter();

  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
    router.push("/");
  }

  async function loadMissions() {
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

    // Auto-expire: active missions whose end_date already passed
    const expireRes = await supabase
      .from("missions")
      .update({ status: "expired" })
      .eq("owner_id", user.id)
      .eq("status", "active")
      .lt("end_date", todayISODate());

    if (expireRes.error) {
      // don't hard-fail — still fetch missions
      console.warn(
        "[missions] auto-expire failed:",
        expireRes.error.message,
        expireRes.error.details
      );
    }

    const { data, error: fetchErr } = await supabase
      .from("missions")
      .select(
        "id, owner_id, name, description, start_date, end_date, status, created_at, updated_at"
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchErr) {
      setError(fetchErr.message);
      setMissions([]);
      setLoading(false);
      return;
    }

    setMissions((data ?? []) as MissionRow[]);
    setLoading(false);
  }

  useEffect(() => {
    loadMissions();
  }, []);

  const active = useMemo(
    () => missions.filter((m) => m.status === "active"),
    [missions]
  );
  const completed = useMemo(
    () => missions.filter((m) => m.status === "completed"),
    [missions]
  );
  const expired = useMemo(
    () => missions.filter((m) => m.status === "expired"),
    [missions]
  );

  async function handleCreateMission(payload: CreateMissionPayload) {
    setError(null);

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

    const row: Omit<MissionRow, "id" | "created_at" | "updated_at"> = {
      owner_id: user.id,
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      start_date: payload.startDate,
      end_date: payload.endDate,
      status: "active",
    };

    const insertRes = await supabase.from("missions").insert(row).select("id").single();

    if (insertRes.error) {
      setError(insertRes.error.message);
      return;
    }

    setIsMissionModalOpen(false);
    await loadMissions();
  }

  return (
    <main className="px-10 pt-5 pb-16 space-y-10 relative">
      {loading && <FullPageLoading />}

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
          {active.length ? (
            <MissionGrid>
              {active.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status={toCardStatus(m.status)}
                  milestonesText="0 / 0 Milestones"
                  dateRangeText={formatDateRange(m.start_date, m.end_date)}
                  watchers={[]}
                  onClick={() => router.push(`/missions/${m.id}`)}
                />
              ))}
            </MissionGrid>
          ) : (
            <EmptyPlaceholder label="NO ACTIVE MISSIONS YET" />
          )}
        </SubSection>

        {completed.length ? (
          <SubSection title="COMPLETED">
            <MissionGrid>
              {completed.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status={toCardStatus(m.status)}
                  milestonesText="0 / 0 Milestones"
                  dateRangeText={formatDateRange(m.start_date, m.end_date)}
                  watchers={[]}
                  onClick={() => router.push(`/missions/${m.id}`)}
                />
              ))}
            </MissionGrid>
          </SubSection>
        ) : (
          <EmptySubSection title="COMPLETED" label="NO COMPLETED MISSIONS YET" />
        )}

        {/* UI label UNSATISFIED, DB uses expired */}
        {expired.length ? (
          <SubSection title="UNSATISFIED">
            <MissionGrid>
              {expired.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status={toCardStatus(m.status)}
                  milestonesText="0 / 0 Milestones"
                  dateRangeText={formatDateRange(m.start_date, m.end_date)}
                  watchers={[]}
                  onClick={() => router.push(`/missions/${m.id}`)}
                />
              ))}
            </MissionGrid>
          </SubSection>
        ) : (
          <EmptySubSection
            title="UNSATISFIED"
            label="NO UNSATISFIED MISSIONS YET"
          />
        )}
      </section>

      {/* ================= WATCHING ================= */}
      <section className="space-y-6">
        <SectionHeader title="WATCHING" />

        <EmptySubSection
          title="ACTIVE"
          label="NO ACTIVE MISSIONS YOU'RE WATCHING"
        />
        <EmptySubSection
          title="COMPLETED"
          label="NO COMPLETED MISSIONS YOU'RE WATCHING"
        />
        <EmptySubSection
          title="UNSATISFIED"
          label="NO UNSATISFIED MISSIONS YOU'RE WATCHING"
        />
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