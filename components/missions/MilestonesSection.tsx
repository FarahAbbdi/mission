"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { BrutalButton } from "@/components/ui/BrutalButton";
import MilestoneCard from "@/components/missions/MilestoneCard";
import MilestoneModal, {
  CreateMilestonePayload,
} from "@/components/missions/MilestoneModal";
import LogModal, { CreateLogPayload } from "@/components/missions/LogModal";

type Props = {
  missionId: string;
  missionStatus?: "active" | "completed" | "expired"; // pass from mission detail page
  readOnly?: boolean; // when true: watcher view (no actions)
};

type MilestoneStatus = "active" | "completed";
type MilestonePriority = "low" | "medium" | "high";

type MilestoneRow = {
  id: string;
  mission_id: string;
  name: string;
  notes: string | null;
  deadline: string; // YYYY-MM-DD
  priority: MilestonePriority;
  status: MilestoneStatus;
  created_at?: string;
};

type LogRow = {
  id: string;
  milestone_id: string;
  content: string;
  created_at: string; // ISO
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-black uppercase tracking-wide text-black">
      {children}
    </div>
  );
}

function EmptyPlaceholder({ text }: { text: string }) {
  return (
    <div className="border-2 border-dashed border-gray-300 px-6 py-10 text-center bg-white">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {text}
      </p>
    </div>
  );
}

// local YYYY-MM-DD (avoid UTC off-by-one)
function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoToDMY(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function priorityToCard(p: MilestonePriority): "LOW" | "MEDIUM" | "HIGH" {
  if (p === "low") return "LOW";
  if (p === "high") return "HIGH";
  return "MEDIUM";
}

function statusToCard(
  s: MilestoneStatus | "unsatisfied"
): "ACTIVE" | "COMPLETED" | "UNSATISFIED" {
  if (s === "completed") return "COMPLETED";
  if (s === "unsatisfied") return "UNSATISFIED";
  return "ACTIVE";
}

export default function MilestonesSection({
  missionId,
  missionStatus = "active",
  readOnly = false,
}: Props) {
  const isMissionLocked =
    missionStatus === "completed" || missionStatus === "expired";

  // true if user should NOT be able to do actions
  const actionsDisabled = readOnly || isMissionLocked;

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  const [rows, setRows] = useState<MilestoneRow[]>([]);
  const [logsByMilestone, setLogsByMilestone] = useState<Record<string, LogRow[]>>(
    {}
  );

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // LOG MODAL state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logMilestoneId, setLogMilestoneId] = useState<string | null>(null);
  const [savingLog, setSavingLog] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function loadMilestonesAndLogs() {
    if (!missionId) return;

    setLoading(true);
    setError(null);

    // 1) milestones
    const res = await supabase
      .from("milestones")
      .select("id, mission_id, name, notes, deadline, priority, status, created_at")
      .eq("mission_id", missionId)
      .order("created_at", { ascending: false });

    if (res.error) {
      setError(res.error.message);
      setRows([]);
      setLogsByMilestone({});
      setLoading(false);
      return;
    }

    const milestoneRows = (res.data ?? []) as MilestoneRow[];
    setRows(milestoneRows);

    // 2) logs for those milestones
    const ids = milestoneRows.map((m) => m.id);
    if (!ids.length) {
      setLogsByMilestone({});
      setLoading(false);
      return;
    }

    const logsRes = await supabase
      .from("logs")
      .select("id, milestone_id, content, created_at")
      .in("milestone_id", ids)
      .order("created_at", { ascending: false });

    if (logsRes.error) {
      // keep milestones even if logs fail
      setLogsByMilestone({});
      setLoading(false);
      return;
    }

    const map: Record<string, LogRow[]> = {};
    for (const l of (logsRes.data ?? []) as LogRow[]) {
      (map[l.milestone_id] ||= []).push(l);
    }
    setLogsByMilestone(map);

    setLoading(false);
  }

  useEffect(() => {
    void loadMilestonesAndLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId]);

  const today = todayLocalISO();

  const unsatisfiedRows = useMemo(() => {
    return rows.filter((r) => {
      if (r.status !== "active") return false;
      if (isMissionLocked) return true;
      return r.deadline < today;
    });
  }, [rows, isMissionLocked, today]);

  const activeRows = useMemo(() => {
    return rows.filter((r) => {
      if (r.status !== "active") return false;
      if (isMissionLocked) return false;
      return !(r.deadline < today);
    });
  }, [rows, isMissionLocked, today]);

  const completedRows = useMemo(
    () => rows.filter((r) => r.status === "completed"),
    [rows]
  );

  async function handleCreateMilestone(payload: CreateMilestonePayload) {
    if (actionsDisabled) return;

    setCreating(true);
    setError(null);

    const insertRes = await supabase
      .from("milestones")
      .insert({
        mission_id: missionId,
        name: payload.name.trim(),
        notes: payload.notes?.trim() || null,
        deadline: payload.deadline,
        priority: payload.priority,
        status: "active",
      })
      .select("id, mission_id, name, notes, deadline, priority, status, created_at")
      .single();

    if (insertRes.error) {
      setError(insertRes.error.message);
      setCreating(false);
      return;
    }

    if (insertRes.data) {
      const newRow = insertRes.data as MilestoneRow;
      setRows((prev) => [newRow, ...prev]);
      setLogsByMilestone((prev) => ({
        ...prev,
        [newRow.id]: prev[newRow.id] ?? [],
      }));
    }

    setIsMilestoneModalOpen(false);
    setCreating(false);
  }

  async function handleToggleMilestoneStatus(id: string, current: MilestoneStatus) {
    if (actionsDisabled) return;

    const next: MilestoneStatus = current === "active" ? "completed" : "active";

    setError(null);
    setTogglingId(id);

    const prevRows = rows;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));

    const updRes = await supabase
      .from("milestones")
      .update({ status: next })
      .eq("id", id)
      .eq("mission_id", missionId)
      .select("id, status")
      .single();

    if (updRes.error) {
      setRows(prevRows);
      setError(updRes.error.message);
      setTogglingId(null);
      return;
    }

    setTogglingId(null);
  }

  async function handleDeleteMilestone(id: string) {
    if (actionsDisabled) return;

    setError(null);
    setDeletingId(id);

    const prevRows = rows;
    const prevLogs = logsByMilestone;

    setRows((prev) => prev.filter((r) => r.id !== id));
    setLogsByMilestone((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    const delRes = await supabase
      .from("milestones")
      .delete()
      .eq("id", id)
      .eq("mission_id", missionId);

    if (delRes.error) {
      setRows(prevRows);
      setLogsByMilestone(prevLogs);
      setError(delRes.error.message);
      setDeletingId(null);
      return;
    }

    setDeletingId(null);
  }

  // LOG MODAL helpers
  function openLogModal(milestoneId: string) {
    if (actionsDisabled) return; // watchers can't add logs
    setLogMilestoneId(milestoneId);
    setIsLogModalOpen(true);
  }

  function closeLogModal() {
    if (savingLog) return;
    setIsLogModalOpen(false);
    setLogMilestoneId(null);
  }

  async function handleCreateLog(payload: CreateLogPayload) {
    if (!logMilestoneId) return;
    if (actionsDisabled) return;

    setSavingLog(true);
    setError(null);

    const ins = await supabase
      .from("logs")
      .insert({
        milestone_id: logMilestoneId,
        content: payload.content.trim(),
      })
      .select("id, milestone_id, content, created_at")
      .single();

    if (ins.error) {
      setError(ins.error.message);
      setSavingLog(false);
      return;
    }

    const newLog = ins.data as LogRow;

    setLogsByMilestone((prev) => {
      const next = { ...prev };
      next[logMilestoneId] = [newLog, ...(next[logMilestoneId] ?? [])];
      return next;
    });

    setSavingLog(false);
    closeLogModal();
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">MILESTONES</h2>

          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            {activeRows.length} active • {completedRows.length} completed •{" "}
            {unsatisfiedRows.length} unsatisfied
            {readOnly ? " • view only" : ""}
          </div>

          {error && (
            <div className="text-xs font-semibold uppercase tracking-widest text-red-600">
              {error}
            </div>
          )}

          {(togglingId || deletingId || savingLog) && (
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              {togglingId ? "Updating…" : deletingId ? "Deleting…" : "Saving log…"}
            </div>
          )}
        </div>

        {/* Only owners can add milestones (and only when active) */}
        {!actionsDisabled && (
          <div className="w-[200px]">
            <BrutalButton
              variant="outline"
              onClick={() => setIsMilestoneModalOpen(true)}
            >
              <span className="inline-flex items-center gap-2 text-sm">
                <span className="text-base leading-none">+</span>
                ADD MILESTONE
              </span>
            </BrutalButton>
          </div>
        )}
      </div>

      {/* ACTIVE */}
      <div className="space-y-4">
        <SectionLabel>ACTIVE</SectionLabel>

        {loading ? (
          <EmptyPlaceholder text="Loading…" />
        ) : activeRows.length ? (
          <div className="space-y-6">
            {activeRows.map((m) => {
              const logs = logsByMilestone[m.id] ?? [];

              return (
                <MilestoneCard
                  key={m.id}
                  title={m.name}
                  subtitle={m.notes ?? undefined}
                  status={statusToCard(m.status)}
                  deadlineText={isoToDMY(m.deadline)}
                  priority={priorityToCard(m.priority)}
                  logs={logs}
                  logsCount={logs.length}
                  checked={m.status === "completed"}
                  isLocked={actionsDisabled} // hides checkbox UI if your card respects isLocked
                  onToggleChecked={
                    actionsDisabled
                      ? undefined
                      : () => handleToggleMilestoneStatus(m.id, m.status)
                  }
                  onAddLog={actionsDisabled ? undefined : () => openLogModal(m.id)}
                  onDelete={actionsDisabled ? undefined : () => handleDeleteMilestone(m.id)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyPlaceholder text="No active milestones" />
        )}
      </div>

      {/* COMPLETED */}
      <div className="space-y-4">
        <SectionLabel>COMPLETED</SectionLabel>

        {loading ? (
          <EmptyPlaceholder text="Loading…" />
        ) : completedRows.length ? (
          <div className="space-y-6">
            {completedRows.map((m) => {
              const logs = logsByMilestone[m.id] ?? [];

              return (
                <MilestoneCard
                  key={m.id}
                  title={m.name}
                  subtitle={m.notes ?? undefined}
                  status={statusToCard(m.status)}
                  deadlineText={isoToDMY(m.deadline)}
                  priority={priorityToCard(m.priority)}
                  logs={logs}
                  logsCount={logs.length}
                  checked={true}
                  isLocked={actionsDisabled}
                  onToggleChecked={
                    actionsDisabled
                      ? undefined
                      : () => handleToggleMilestoneStatus(m.id, m.status)
                  }
                  onAddLog={actionsDisabled ? undefined : () => openLogModal(m.id)}
                  onDelete={actionsDisabled ? undefined : () => handleDeleteMilestone(m.id)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyPlaceholder text="No completed milestones" />
        )}
      </div>

      {/* UNSATISFIED */}
      <div className="space-y-4">
        <SectionLabel>UNSATISFIED</SectionLabel>

        {loading ? (
          <EmptyPlaceholder text="Loading…" />
        ) : unsatisfiedRows.length ? (
          <div className="space-y-6">
            {unsatisfiedRows.map((m) => {
              const logs = logsByMilestone[m.id] ?? [];

              return (
                <MilestoneCard
                  key={m.id}
                  title={m.name}
                  subtitle={m.notes ?? undefined}
                  status={statusToCard("unsatisfied")}
                  deadlineText={isoToDMY(m.deadline)}
                  priority={priorityToCard(m.priority)}
                  logs={logs}
                  logsCount={logs.length}
                  checked={false}
                  isLocked={true} // unsatisfied always locked
                  onAddLog={undefined}
                  onToggleChecked={undefined}
                  onDelete={actionsDisabled ? undefined : () => handleDeleteMilestone(m.id)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyPlaceholder text="No unsatisfied milestones" />
        )}
      </div>

      {/* Only owners can open modals */}
      {!actionsDisabled && (
        <>
          <MilestoneModal
            open={isMilestoneModalOpen}
            onClose={() => setIsMilestoneModalOpen(false)}
            onCreate={handleCreateMilestone}
          />

          <LogModal open={isLogModalOpen} onClose={closeLogModal} onCreate={handleCreateLog} />

          {creating && (
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Creating…
            </div>
          )}
        </>
      )}
    </section>
  );
}