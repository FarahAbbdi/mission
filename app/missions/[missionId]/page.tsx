"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import MissionDetailTopBar from "@/components/missions/MissionDetailTopBar";
import MissionDetailHeader from "@/components/missions/MissionDetailHeader";
import MilestonesSection from "@/components/missions/MilestonesSection";
import WatcherModal from "@/components/missions/WatcherModal";
import StopWatchingButton from "@/components/ui/StopWatchingButton";

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

function formatName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase();
}

export default function MissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params?.missionId as string | undefined;

  const [mission, setMission] = useState<MissionRow | null>(null);
  const [watchers, setWatchers] = useState<WatcherChipData[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewerUserId, setViewerUserId] = useState<string | null>(null);
  const isOwner = useMemo(
    () => Boolean(viewerUserId && mission?.owner_id && viewerUserId === mission.owner_id),
    [viewerUserId, mission?.owner_id]
  );
  const [isWatching, setIsWatching] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [markingSatisfied, setMarkingSatisfied] = useState(false);

  const [isWatcherModalOpen, setIsWatcherModalOpen] = useState(false);
  const [addingWatcher, setAddingWatcher] = useState(false);

  const [stoppingWatching, setStoppingWatching] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function loadMissionAndMode() {
    if (!missionId) {
      setError("Mission not found.");
      setMission(null);
      setWatchers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Who is viewing?
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      setError(userErr.message);
      setMission(null);
      setWatchers([]);
      setLoading(false);
      return;
    }

    if (!user) {
      setError("You must be logged in.");
      setMission(null);
      setWatchers([]);
      setLoading(false);
      return;
    }

    setViewerUserId(user.id);

    // Load mission
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

    const m = missionRes.data as MissionRow;
    setMission(m);

    const ownerView = user.id === m.owner_id;

    // Determine if viewer is watching (only matters if not owner)
    if (!ownerView) {
      const watchingRes = await supabase
        .from("watchers")
        .select("mission_id")
        .eq("mission_id", missionId)
        .eq("watcher_id", user.id)
        .maybeSingle();

      setIsWatching(Boolean(watchingRes.data) && !watchingRes.error);
      // watcher-view: we REMOVE watcher section, so don't fetch watcher chips
      setWatchers([]);
      setLoading(false);
      return;
    }

    // owner-view: load watcher chips
    const watchersRes = await supabase
      .from("watchers")
      .select("watcher_id")
      .eq("mission_id", missionId);

    if (watchersRes.error) {
      setWatchers([]);
      setIsWatching(false);
      setLoading(false);
      return;
    }

    const watcherIds = (watchersRes.data ?? [])
      .map((w) => w.watcher_id)
      .filter(Boolean);

    if (!watcherIds.length) {
      setWatchers([]);
      setIsWatching(false);
      setLoading(false);
      return;
    }

    const profilesRes = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", watcherIds);

    if (profilesRes.error) {
      setWatchers([]);
      setIsWatching(false);
      setLoading(false);
      return;
    }

    const nameById = new Map<string, string>(
      (profilesRes.data ?? []).map((p) => [p.id, p.name])
    );

    const mapped: WatcherChipData[] = watcherIds.map((id) => {
      const rawName =
        nameById.get(id) ?? id.replace(/-/g, "").slice(0, 6).toUpperCase();
      const name = formatName(rawName);

      return {
        name,
        initial: (name[0] ?? "U").toUpperCase(),
      };
    });

    setWatchers(mapped);
    setIsWatching(false);
    setLoading(false);
  }

  useEffect(() => {
    void loadMissionAndMode();
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

  async function handleStopWatching() {
    if (!missionId) return;

    setStoppingWatching(true);
    setError(null);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      setError(userErr.message);
      setStoppingWatching(false);
      return;
    }
    if (!user) {
      setError("You must be logged in.");
      setStoppingWatching(false);
      return;
    }

    const del = await supabase
      .from("watchers")
      .delete()
      .eq("mission_id", missionId)
      .eq("watcher_id", user.id);

    if (del.error) {
      setError(del.error.message);
      setStoppingWatching(false);
      return;
    }

    router.push("/missions");
  }

  async function handleAddWatcherByEmail(rawEmail: string) {
    if (!missionId) return;

    const lookupEmail = rawEmail.trim().toLowerCase();
    if (!lookupEmail) {
      setError("Email is required.");
      return;
    }

    setAddingWatcher(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) throw new Error(userErr.message);
      if (!user) throw new Error("You must be logged in.");

      const profRes = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("email", lookupEmail)
        .maybeSingle();

      if (profRes.error) throw new Error(profRes.error.message);
      if (!profRes.data) throw new Error("No user found with that email.");

      const watcherId = profRes.data.id;
      if (watcherId === user.id) throw new Error("You can’t add yourself as a watcher.");

      const ins = await supabase.from("watchers").insert({
        mission_id: missionId,
        watcher_id: watcherId,
      });

      if (ins.error) {
        if (ins.error.code === "23505") {
          throw new Error("That user is already watching this mission.");
        }
        throw new Error(ins.error.message);
      }

      await loadMissionAndMode();
      setIsWatcherModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setAddingWatcher(false);
    }
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

      <div className="px-4 sm:px-8 lg:px-12">
        <MissionDetailTopBar />
      </div>

      <section className="relative flex-1">
        <div className="hidden lg:block absolute inset-y-0 left-[38%] right-0 bg-gray-50 z-0" />
        <div className="hidden lg:block absolute inset-y-0 left-[38%] w-[4px] bg-black z-10" />

        <div className="relative z-20 h-full px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row h-full">
            {/* LEFT */}
            <div className="w-full lg:w-[38%] lg:pr-10 pt-10 pb-10 lg:pb-16 space-y-6">
              {mission && (
                <>
                  {isOwner ? (
                    <MissionDetailHeader
                      title={mission.name}
                      statusLabel={statusToLabel(mission.status)}
                      startDateText={formatDate(mission.start_date)}
                      endDateText={formatDate(mission.end_date)}
                      description={mission.description ?? ""}
                      watchers={watchers}
                      onMarkSatisfied={handleMarkSatisfied}
                      onDeleteMission={handleDeleteMission}
                      onAddWatcher={() => setIsWatcherModalOpen(true)}
                    />
                  ) : (
                    // WATCHER VIEW: no add watcher, no delete, no mark satisfied, no watcher section
                    <div className="space-y-7">
                      {/* Status + Title */}
                      <div className="space-y-5">
                        <div className="inline-flex items-center border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                          {statusToLabel(mission.status)}
                         </div>
                           <h1 className="text-4xl font-black tracking-tight leading-[1.05]">
                           {mission.name}
                           </h1>
                        </div>

                        {/* Dates */}
                        <div className="space-y-2">
                            <div className="border-2 border-black bg-white">
                            <div className="px-4 py-2.5">
                                <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                                Start date
                                </div>
                                <div className="mt-0.5 text-lg font-semibold leading-tight">
                                {formatDate(mission.start_date)}
                                </div>
                            </div>

                            <div className="border-t-2 border-black" />

                            <div className="px-4 py-2.5">
                                <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                                End date
                                </div>
                                <div className="mt-0.5 text-lg font-semibold leading-tight">
                                {formatDate(mission.end_date)}
                                </div>
                            </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            DESCRIPTION
                            </div>

                            {mission.description?.trim() ? (
                            <div className="border-2 border-black bg-gray-50 px-4 py-3">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {mission.description}
                                </p>
                            </div>
                            ) : (
                            <div className="border-2 border-dashed border-gray-300 px-4 py-6 bg-white">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                NO DESCRIPTION
                                </p>
                            </div>
                            )}
                        </div>

                        {/* Actions (watcher-only) */}
                        {isWatching && (
                           <StopWatchingButton
                              disabled={stoppingWatching}
                              onClick={handleStopWatching}
                           />
                      )}
                    </div>
                  )}
                </>
              )}

              {(markingSatisfied || deleting) && (
                <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                  {markingSatisfied ? "Marking satisfied…" : "Deleting…"}
                </div>
              )}

              {error && (
                <div className="text-xs font-semibold uppercase tracking-widest text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="w-full lg:flex-1 lg:pl-10 pt-0 lg:pt-10 pb-16">
              {missionId && mission && (
                // If you want MilestonesSection to be truly read-only for watchers,
                // add a prop in that component (e.g. `readOnly`) and use it to hide "Add Milestone".
                <MilestonesSection
                  missionId={missionId}
                  missionStatus={mission.status}
                  readOnly={!isOwner}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Only owners can add watchers */}
      {isOwner && (
        <WatcherModal
          open={isWatcherModalOpen}
          onClose={() => {
            if (addingWatcher) return;
            setIsWatcherModalOpen(false);
          }}
          loading={addingWatcher}
          onCreate={async ({ email }) => handleAddWatcherByEmail(email)}
        />
      )}
    </main>
  );
}