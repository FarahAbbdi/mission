"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import MissionDetailTopBar from "@/components/missions/MissionDetailTopBar";
import MissionDetailHeader from "@/components/missions/MissionDetailHeader";
import MilestonesSection from "@/components/missions/MilestonesSection";

type MissionRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  status: "active" | "completed" | "expired";
};

type WatcherChipData = {
  initial: string;
  name: string;
};

type WatcherRow = {
  watcher_id: string;
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function statusToLabel(
  status: MissionRow["status"]
): "ACTIVE" | "COMPLETED" | "UNSATISFIED" {
  if (status === "completed") return "COMPLETED";
  if (status === "expired") return "UNSATISFIED";
  return "ACTIVE";
}

// Client-safe fallback label from watcher_id
function chipFromWatcherId(watcherId: string): WatcherChipData {
  const short = watcherId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return {
    name: short,
    initial: short[0] ?? "U",
  };
}

export default function MissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params?.missionId as string;

  const [mission, setMission] = useState<MissionRow | null>(null);
  const [watchers, setWatchers] = useState<WatcherChipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMissionAndWatchers() {
      if (!missionId) return;

      setLoading(true);
      setError(null);

      /* ---------- LOAD MISSION ---------- */
      const missionRes = await supabase
        .from("missions")
        .select("id, owner_id, name, description, start_date, end_date, status")
        .eq("id", missionId)
        .single();

      if (missionRes.error) {
        setError("Mission not found.");
        setMission(null);
        setWatchers([]);
        setLoading(false);
        return;
      }

      setMission(missionRes.data as MissionRow);

      /* ---------- LOAD WATCHERS ---------- */
      const watchersRes = await supabase
        .from("watchers")
        .select("watcher_id")
        .eq("mission_id", missionId);

      if (watchersRes.error) {
        setWatchers([]);
        setLoading(false);
        return;
      }

      const mapped = ((watchersRes.data ?? []) as WatcherRow[])
        .filter((row) => !!row.watcher_id)
        .map((row) => chipFromWatcherId(row.watcher_id));

      setWatchers(mapped);
      setLoading(false);
    }

    loadMissionAndWatchers();
  }, [missionId]);

  /* ---------- DELETE ---------- */
  async function handleDeleteMission() {
    if (!missionId) return;

    setDeleting(true);
    setError(null);

    const res = await supabase
      .from("missions")
      .delete()
      .eq("id", missionId);

    if (res.error) {
      setError(res.error.message);
      setDeleting(false);
      return;
    }

    // CASCADE deletes watchers automatically
    router.push("/missions");
  }

  /* ---------- STATES ---------- */

  if (loading) {
    return (
      <main className="px-12 pt-10 text-sm font-semibold uppercase tracking-widest">
        Loading mission…
      </main>
    );
  }

  if (error || !mission) {
    return (
      <main className="px-12 pt-10 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
          {error ?? "Mission not found"}
        </p>

        <button
          onClick={() => router.push("/missions")}
          className="underline text-sm font-semibold"
        >
          Back to missions
        </button>
      </main>
    );
  }

  /* ---------- RENDER ---------- */

  return (
    <main className="min-h-screen flex flex-col">
      <div className="px-12">
        <MissionDetailTopBar />
      </div>

      <section className="relative flex-1">
        {/* Right-side background */}
        <div
          className="
            absolute inset-y-0
            left-[38%]
            right-0
            bg-gray-50
            z-0
          "
        />

        {/* Divider */}
        <div
          className="
            absolute inset-y-0
            left-[38%]
            w-[4px]
            bg-black
            z-10
          "
        />

        <div className="relative z-20 h-full px-12">
          <div className="flex h-full">
            {/* LEFT — Mission details */}
            <div className="w-[38%] pr-10 pt-10 space-y-10">
              <MissionDetailHeader
                title={mission.name}
                statusLabel={statusToLabel(mission.status)}
                startDateText={formatDate(mission.start_date)}
                endDateText={formatDate(mission.end_date)}
                description={mission.description ?? ""}
                watchers={watchers}
                onDeleteMission={handleDeleteMission}
              />

              {deleting && (
                <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                  Deleting…
                </div>
              )}
            </div>

            {/* RIGHT — Milestones */}
            <div className="flex-1 pl-10 pt-10 pb-16">
              <MilestonesSection
                onAddMilestone={() =>
                  console.log("[ui] add milestone for mission:", mission.id)
                }
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}