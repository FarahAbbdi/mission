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

function chipFromWatcherId(watcherId: string): WatcherChipData {
  const short = (watcherId || "user").replace(/-/g, "").slice(0, 6).toUpperCase();
  return { name: short, initial: short[0] ?? "U" };
}

export default function MissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params?.missionId as string | undefined;

  const [mission, setMission] = useState<MissionRow | null>(null);
  const [watchers, setWatchers] = useState<WatcherChipData[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleting, setDeleting] = useState(false);
  const [markingSatisfied, setMarkingSatisfied] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function loadMissionAndWatchers() {
    if (!missionId) {
      setError("Mission not found.");
      setMission(null);
      setWatchers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const missionRes = await supabase
      .from("missions")
      .select("id, owner_id, name, description, start_date, end_date, status")
      .eq("id", missionId)
      .single();

    if (missionRes.error || !missionRes.data) {
      setError("Mission not found.");
      setMission(null);
      setWatchers([]);
      setLoading(false);
      return;
    }

    setMission(missionRes.data as MissionRow);

    const watchersRes = await supabase
      .from("watchers")
      .select("watcher_id")
      .eq("mission_id", missionId);

    if (watchersRes.error) {
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

  useEffect(() => {
    loadMissionAndWatchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId]);

  async function handleMarkSatisfied() {
    if (!missionId) return;

    setMarkingSatisfied(true);
    setError(null);

    const res = await supabase
      .from("missions")
      .update({ status: "completed" })
      .eq("id", missionId)
      .select("id, status")
      .single();

    if (res.error) {
      setError(res.error.message);
      setMarkingSatisfied(false);
      return;
    }

    router.push("/missions");
  }

  async function handleDeleteMission() {
    if (!missionId) return;

    setDeleting(true);
    setError(null);

    const res = await supabase.from("missions").delete().eq("id", missionId);

    if (res.error) {
      setError(res.error.message);
      setDeleting(false);
      return;
    }

    router.push("/missions");
  }

  if (!loading && (error || !mission)) {
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

  return (
    <main className="min-h-screen flex flex-col">
      {loading && <FullPageLoading />}

      {/* keep your desktop padding; just add responsive fallback */}
      <div className="px-4 sm:px-8 lg:px-12">
        <MissionDetailTopBar />
      </div>

      <section className="relative flex-1">
        {/* Desktop-only background split + divider (prevents mobile weird gaps) */}
        <div className="hidden lg:block absolute inset-y-0 left-[38%] right-0 bg-gray-50 z-0" />
        <div className="hidden lg:block absolute inset-y-0 left-[38%] w-[4px] bg-black z-10" />

        <div className="relative z-20 h-full px-4 sm:px-8 lg:px-12">
          {/* stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col lg:flex-row h-full">
            {/* LEFT */}
            <div className="w-full lg:w-[38%] lg:pr-10 pt-10 pb-10 lg:pb-16 space-y-6">
              {mission && (
                <MissionDetailHeader
                  title={mission.name}
                  statusLabel={statusToLabel(mission.status)}
                  startDateText={formatDate(mission.start_date)}
                  endDateText={formatDate(mission.end_date)}
                  description={mission.description ?? ""}
                  watchers={watchers}
                  onMarkSatisfied={handleMarkSatisfied}
                  onDeleteMission={handleDeleteMission}
                />
              )}

              {(markingSatisfied || deleting) && (
                <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                  {markingSatisfied ? "Marking satisfied…" : "Deleting…"}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="w-full lg:flex-1 lg:pl-10 pt-0 lg:pt-10 pb-16">
              {missionId && mission && (
                <MilestonesSection
                  missionId={missionId}
                  missionStatus={mission.status}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}