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
  end_date: string; // YYYY-MM-DD
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

// Since we don't have access to auth.users from the client,
// show a stable fallback label derived from the watcher_id.
function chipFromWatcherId(watcherId: string): WatcherChipData {
  const short = (watcherId || "user").replace(/-/g, "").slice(0, 6).toUpperCase();
  return {
    name: short, // e.g. "A1B2C3"
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMissionAndWatchers() {
      if (!missionId) return;

      setLoading(true);
      setError(null);

      // ----- Mission -----
      const missionRes = await supabase
        .from("missions")
        .select("id, owner_id, name, description, start_date, end_date, status")
        .eq("id", missionId)
        .single();

      if (missionRes.error) {
        console.error("[missionDetail] loadMission error:", missionRes.error);
        setError("Mission not found.");
        setMission(null);
        setWatchers([]);
        setLoading(false);
        return;
      }

      setMission(missionRes.data as MissionRow);

      // ----- Watchers (NO auth.users join; just watcher_id list) -----
      const watchersRes = await supabase
        .from("watchers")
        .select("watcher_id")
        .eq("mission_id", missionId);

      if (watchersRes.error) {
        console.error(
          "[missionDetail] loadWatchers error:",
          watchersRes.error.message,
          watchersRes.error.details
        );
        // Don't hard-fail the page if watchers fails
        setWatchers([]);
        setLoading(false);
        return;
      }

      const mapped: WatcherChipData[] = ((watchersRes.data ?? []) as WatcherRow[])
        .filter((row) => !!row.watcher_id)
        .map((row) => chipFromWatcherId(row.watcher_id));

      setWatchers(mapped);
      setLoading(false);
    }

    loadMissionAndWatchers();
  }, [missionId]);

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
      {/* Top bar */}
      <div className="px-12">
        <MissionDetailTopBar />
      </div>

      {/* Main content */}
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

        {/* Vertical divider */}
        <div
          className="
            absolute inset-y-0
            left-[38%]
            w-[4px]
            bg-black
            z-10
          "
        />

        {/* Content */}
        <div className="relative z-20 h-full px-12">
          <div className="flex h-full">
            {/* LEFT COLUMN — Mission details */}
            <div className="w-[38%] pr-10 pt-10 space-y-10">
              <MissionDetailHeader
                title={mission.name}
                statusLabel={statusToLabel(mission.status)}
                startDateText={formatDate(mission.start_date)}
                endDateText={formatDate(mission.end_date)}
                description={mission.description ?? ""}
                watchers={watchers} // [] => no chips / placeholder handled in header
              />
            </div>

            {/* RIGHT COLUMN — Milestones */}
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