"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { BrutalButton } from "@/components/ui/BrutalButton";
import MilestoneCard from "@/components/missions/MilestoneCard";
import MilestoneModal, {
  CreateMilestonePayload,
} from "@/components/missions/MilestoneModal";

type Props = {
  missionId: string;
  missionStatus?: "active" | "completed" | "expired"; // pass from mission detail page
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

function statusToCard(s: MilestoneStatus): "ACTIVE" | "COMPLETED" {
  return s === "completed" ? "COMPLETED" : "ACTIVE";
}

export default function MilestonesSection({
  missionId,
  missionStatus = "active",
}: Props) {
  const isMissionLocked = missionStatus === "completed" || missionStatus === "expired";

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  const [rows, setRows] = useState<MilestoneRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function loadMilestones() {
    if (!missionId) return;

    setLoading(true);
    setError(null);

    const res = await supabase
      .from("milestones")
      .select("id, mission_id, name, notes, deadline, priority, status, created_at")
      .eq("mission_id", missionId)
      .order("created_at", { ascending: false });

    if (res.error) {
      setError(res.error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((res.data ?? []) as MilestoneRow[]);
    setLoading(false);
  }

  useEffect(() => {
    loadMilestones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId]);

  // UNSATISFIED logic
  const today = todayLocalISO();

  const unsatisfiedRows = useMemo(() => {
    return rows.filter((r) => {
      if (r.status !== "active") return false;

      // If mission is completed/expired, any active milestone is unsatisfied
      if (isMissionLocked) return true;

      // Otherwise: active milestone past deadline is unsatisfied
      // NOTE: deadline is YYYY-MM-DD so lex compare works
      return r.deadline < today;
    });
  }, [rows, isMissionLocked, today]);

  const activeRows = useMemo(() => {
    return rows.filter((r) => {
      if (r.status !== "active") return false;

      // active mission only
      if (isMissionLocked) return false;

      // exclude unsatisfied (past deadline)
      return !(r.deadline < today);
    });
  }, [rows, isMissionLocked, today]);

  const completedRows = useMemo(
    () => rows.filter((r) => r.status === "completed"),
    [rows]
  );

  async function handleCreateMilestone(payload: CreateMilestonePayload) {
    if (isMissionLocked) return;

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

    if (insertRes.data) setRows((prev) => [insertRes.data as MilestoneRow, ...prev]);

    setIsMilestoneModalOpen(false);
    setCreating(false);
  }

  async function handleToggleMilestoneStatus(id: string, current: MilestoneStatus) {
    if (isMissionLocked) return;

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
    // delete is allowed even when mission locked (you asked to keep it)
    setError(null);
    setDeletingId(id);

    const prevRows = rows;
    setRows((prev) => prev.filter((r) => r.id !== id));

    const delRes = await supabase
      .from("milestones")
      .delete()
      .eq("id", id)
      .eq("mission_id", missionId);

    if (delRes.error) {
      setRows(prevRows);
      setError(delRes.error.message);
      setDeletingId(null);
      return;
    }

    setDeletingId(null);
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">MILESTONES</h2>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            {activeRows.length} active • {completedRows.length} completed • {unsatisfiedRows.length} unsatisfied
          </div>

          {error && (
            <div className="text-xs font-semibold uppercase tracking-widest text-red-600">
              {error}
            </div>
          )}

          {(togglingId || deletingId) && (
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              {togglingId ? "Updating…" : "Deleting…"}
            </div>
          )}
        </div>

        {/* Hide ADD MILESTONE button when mission is completed/expired */}
        {!isMissionLocked && (
          <div className="w-[200px]">
            <BrutalButton variant="outline" onClick={() => setIsMilestoneModalOpen(true)}>
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
            {activeRows.map((m) => (
              <MilestoneCard
                key={m.id}
                title={m.name}
                subtitle={m.notes ?? undefined}
                status={statusToCard(m.status)}
                deadlineText={isoToDMY(m.deadline)}
                priority={priorityToCard(m.priority)}
                logsCount={0}
                checked={false}
                isLocked={isMissionLocked} // hides checkbox + add log if mission locked
                onToggleChecked={() => handleToggleMilestoneStatus(m.id, m.status)}
                onAddLog={() => console.log("[milestone] add log:", m.id)}
                onDelete={() => handleDeleteMilestone(m.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder text="No active milestones yet" />
        )}
      </div>

      {/* COMPLETED */}
      <div className="space-y-4">
        <SectionLabel>COMPLETED</SectionLabel>

        {loading ? (
          <EmptyPlaceholder text="Loading…" />
        ) : completedRows.length ? (
          <div className="space-y-6">
            {completedRows.map((m) => (
              <MilestoneCard
                key={m.id}
                title={m.name}
                subtitle={m.notes ?? undefined}
                status={statusToCard(m.status)}
                deadlineText={isoToDMY(m.deadline)}
                priority={priorityToCard(m.priority)}
                logsCount={0}
                checked={true}
                isLocked={isMissionLocked} // still allows delete (card controls it)
                onToggleChecked={() => handleToggleMilestoneStatus(m.id, m.status)}
                onAddLog={() => console.log("[milestone] add log:", m.id)}
                onDelete={() => handleDeleteMilestone(m.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder text="No completed milestones yet" />
        )}
      </div>

      {/* UNSATISFIED (UI label) */}
      <div className="space-y-4">
        <SectionLabel>UNSATISFIED</SectionLabel>

        {loading ? (
          <EmptyPlaceholder text="Loading…" />
        ) : unsatisfiedRows.length ? (
          <div className="space-y-6">
            {unsatisfiedRows.map((m) => (
              <MilestoneCard
                key={m.id}
                title={m.name}
                subtitle={m.notes ?? undefined}
                // We pass UNSATISFIED for the card style, but we’ll show UNSATISFIED label in the card (next file)
                status={"UNSATISFIED"}
                deadlineText={isoToDMY(m.deadline)}
                priority={priorityToCard(m.priority)}
                logsCount={0}
                checked={false}
                isLocked={true}
                onDelete={() => handleDeleteMilestone(m.id)} 
              />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder text="No unsatisfied milestones yet" />
        )}
      </div>

      {/* MODAL */}
      <MilestoneModal
        open={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onCreate={handleCreateMilestone}
      />

      {creating && (
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Creating…
        </div>
      )}
    </section>
  );
}