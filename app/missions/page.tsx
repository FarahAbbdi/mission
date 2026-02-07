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

type MilestoneStatus = "active" | "completed" | "expired";
type MilestoneRowLite = {
  mission_id: string;
  status: MilestoneStatus;
};

type MilestoneCountMap = Record<string, { total: number; completed: number }>;

type WatchingJoinRow = {
  mission_id: string;
  mission: MissionRow | null;
};

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

function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function MissionsPage() {
  const router = useRouter();

  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);

  // MY missions
  const [missions, setMissions] = useState<MissionRow[]>([]);
  // WATCHING missions
  const [watchingMissions, setWatchingMissions] = useState<MissionRow[]>([]);

  // milestone counts for both MY + WATCHING
  const [milestoneCounts, setMilestoneCounts] = useState<MilestoneCountMap>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    await supabase.auth.signOut();
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
      setWatchingMissions([]);
      setMilestoneCounts({});
      setLoading(false);
      return;
    }

    if (!user) {
      setMissions([]);
      setWatchingMissions([]);
      setMilestoneCounts({});
      setLoading(false);
      return;
    }

    // Auto-expire MY missions whose end_date already passed (only active ones)
    await supabase
      .from("missions")
      .update({ status: "expired" })
      .eq("owner_id", user.id)
      .eq("status", "active")
      .lt("end_date", todayISODate());

    // 1) Fetch MY missions
    const missionsRes = await supabase
      .from("missions")
      .select(
        "id, owner_id, name, description, start_date, end_date, status, created_at, updated_at"
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (missionsRes.error) {
      setError(missionsRes.error.message);
      setMissions([]);
      setWatchingMissions([]);
      setMilestoneCounts({});
      setLoading(false);
      return;
    }

    const myMissionRows = (missionsRes.data ?? []) as MissionRow[];
    setMissions(myMissionRows);

    // Fetch WATCHING missions via watchers join
    const watchingRes = await supabase
      .from("watchers")
      .select(
        `
        mission_id,
        mission:missions (
          id, owner_id, name, description, start_date, end_date, status, created_at, updated_at
        )
        `
      )
      .eq("watcher_id", user.id);

    let watchingJoinedMissions: MissionRow[] = [];

    if (watchingRes.error) {
      setWatchingMissions([]);
    } else {
      const raw = (watchingRes.data ?? []) as unknown[];

      const normalized = raw.map((item) => {
        const rec = item as Record<string, unknown>;
        const missionField = rec["mission"];
        let missionObj: MissionRow | null = null;

        if (Array.isArray(missionField)) {
          missionObj = (missionField[0] as MissionRow) ?? null;
        } else if (missionField && typeof missionField === "object") {
          missionObj = missionField as MissionRow;
        }

        return {
          mission_id: String(rec["mission_id"] ?? ""),
          mission: missionObj,
        } as { mission_id: string; mission: MissionRow | null };
      });

      const joinedMissions = normalized
        .map((r) => r.mission)
        .filter((m): m is MissionRow => Boolean(m));

      const watchingOnly = joinedMissions.filter((m) => m.owner_id !== user.id);

      const uniq = new Map<string, MissionRow>();
      for (const m of watchingOnly) uniq.set(m.id, m);

      watchingJoinedMissions = Array.from(uniq.values());
      setWatchingMissions(watchingJoinedMissions);
    }

    // 3) Fetch milestone counts for BOTH sets (MY + WATCHING)
    const allIds = [
      ...myMissionRows.map((m) => m.id),
      ...watchingJoinedMissions.map((m) => m.id),
    ];
    const uniqueIds = Array.from(new Set(allIds));

    if (!uniqueIds.length) {
      setMilestoneCounts({});
      setLoading(false);
      return;
    }

    const milestonesRes = await supabase
      .from("milestones")
      .select("mission_id, status")
      .in("mission_id", uniqueIds);

    if (milestonesRes.error) {
      setMilestoneCounts({});
      setLoading(false);
      return;
    }

    const milestoneRows = (milestonesRes.data ?? []) as MilestoneRowLite[];

    const counts: MilestoneCountMap = {};
    for (const row of milestoneRows) {
      if (!row?.mission_id) continue;
      if (!counts[row.mission_id]) counts[row.mission_id] = { total: 0, completed: 0 };
      counts[row.mission_id].total += 1;
      if (row.status === "completed") counts[row.mission_id].completed += 1;
    }

    setMilestoneCounts(counts);
    setLoading(false);
  }

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadMissions();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======================= MY groupings =======================
  const myActive = useMemo(
    () => missions.filter((m) => m.status === "active"),
    [missions]
  );
  const myCompleted = useMemo(
    () => missions.filter((m) => m.status === "completed"),
    [missions]
  );
  const myExpired = useMemo(
    () => missions.filter((m) => m.status === "expired"),
    [missions]
  );

  // ======================= WATCHING groupings =======================
  const watchingActive = useMemo(
    () => watchingMissions.filter((m) => m.status === "active"),
    [watchingMissions]
  );
  const watchingCompleted = useMemo(
    () => watchingMissions.filter((m) => m.status === "completed"),
    [watchingMissions]
  );
  const watchingExpired = useMemo(
    () => watchingMissions.filter((m) => m.status === "expired"),
    [watchingMissions]
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

    const insertRes = await supabase
      .from("missions")
      .insert(row)
      .select("id")
      .single();

    if (insertRes.error) {
      setError(insertRes.error.message);
      return;
    }

    setIsMissionModalOpen(false);
    await loadMissions();
  }

  function milestonesTextFor(missionId: string) {
    const c = milestoneCounts[missionId];
    const completedCount = c?.completed ?? 0;
    const totalCount = c?.total ?? 0;
    return `${completedCount} / ${totalCount} Milestones`;
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
          {myActive.length ? (
            <MissionGrid>
              {myActive.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status={toCardStatus(m.status)}
                  milestonesText={milestonesTextFor(m.id)}
                  dateRangeText={formatDateRange(m.start_date, m.end_date)}
                  watchers={[]}
                  onClick={() => router.push(`/missions/${m.id}`)}
                />
              ))}
            </MissionGrid>
          ) : (
            <EmptyPlaceholder label="NO ACTIVE MISSIONS" />
          )}
        </SubSection>

        {myCompleted.length ? (
          <SubSection title="COMPLETED">
            <MissionGrid>
              {myCompleted.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status={toCardStatus(m.status)}
                  milestonesText={milestonesTextFor(m.id)}
                  dateRangeText={formatDateRange(m.start_date, m.end_date)}
                  watchers={[]}
                  onClick={() => router.push(`/missions/${m.id}`)}
                />
              ))}
            </MissionGrid>
          </SubSection>
        ) : (
          <EmptySubSection title="COMPLETED" label="NO COMPLETED MISSIONS" />
        )}

        {myExpired.length ? (
          <SubSection title="UNSATISFIED">
            <MissionGrid>
              {myExpired.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status={toCardStatus(m.status)}
                  milestonesText={milestonesTextFor(m.id)}
                  dateRangeText={formatDateRange(m.start_date, m.end_date)}
                  watchers={[]}
                  onClick={() => router.push(`/missions/${m.id}`)}
                />
              ))}
            </MissionGrid>
          </SubSection>
        ) : (
          <EmptySubSection title="UNSATISFIED" label="NO UNSATISFIED MISSIONS" />
        )}
      </section>

      {/* ================= WATCHING ================= */}
      <section className="space-y-6">
        <SectionHeader title="WATCHING" />

        <SubSection title="ACTIVE">
          {watchingActive.length ? (
            <MissionGrid>
              {watchingActive.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status={toCardStatus(m.status)}
                  milestonesText={milestonesTextFor(m.id)}
                  dateRangeText={formatDateRange(m.start_date, m.end_date)}
                  watchers={[]}
                  onClick={() => router.push(`/missions/${m.id}`)}
                />
              ))}
            </MissionGrid>
          ) : (
            <EmptyPlaceholder label="NO ACTIVE MISSIONS YOU'RE WATCHING" />
          )}
        </SubSection>

        {watchingCompleted.length ? (
          <SubSection title="COMPLETED">
            <MissionGrid>
              {watchingCompleted.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status={toCardStatus(m.status)}
                  milestonesText={milestonesTextFor(m.id)}
                  dateRangeText={formatDateRange(m.start_date, m.end_date)}
                  watchers={[]}
                  onClick={() => router.push(`/missions/${m.id}`)}
                />
              ))}
            </MissionGrid>
          </SubSection>
        ) : (
          <EmptySubSection
            title="COMPLETED"
            label="NO COMPLETED MISSIONS YOU'RE WATCHING"
          />
        )}

        {watchingExpired.length ? (
          <SubSection title="UNSATISFIED">
            <MissionGrid>
              {watchingExpired.map((m) => (
                <MissionCard
                  key={m.id}
                  title={m.name}
                  status={toCardStatus(m.status)}
                  milestonesText={milestonesTextFor(m.id)}
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
            label="NO UNSATISFIED MISSIONS YOU'RE WATCHING"
          />
        )}
      </section>

      <MissionModal
        open={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        onCreate={handleCreateMission}
      />
    </main>
  );
}