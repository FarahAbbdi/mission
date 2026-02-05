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

export default function MilestonesSection({ missionId }: Props) {
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  const [rows, setRows] = useState<MilestoneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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

  const activeRows = useMemo(
    () => rows.filter((r) => r.status === "active"),
    [rows]
  );
  const completedRows = useMemo(
    () => rows.filter((r) => r.status === "completed"),
    [rows]
  );

  async function handleCreateMilestone(payload: CreateMilestonePayload) {
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
      .select("id")
      .single();

    if (insertRes.error) {
      setError(insertRes.error.message);
      setCreating(false);
      return;
    }

    setIsMilestoneModalOpen(false);
    setCreating(false);

    await loadMilestones();
  }

  async function handleDeleteMilestone(milestoneId: string) {
    if (!missionId) return;

    setError(null);
    setDeletingId(milestoneId);

    // snapshot for rollback
    const prevRows = rows;

    // ✅ optimistic remove from UI
    setRows((cur) => cur.filter((r) => r.id !== milestoneId));

    // ✅ delete in DB (extra safety: ensure it belongs to this mission)
    const delRes = await supabase
      .from("milestones")
      .delete()
      .eq("id", milestoneId)
      .eq("mission_id", missionId);

    if (delRes.error) {
      // rollback UI
      setRows(prevRows);
      setError(delRes.error.message);
      setDeletingId(null);
      return;
    }

    setDeletingId(null);
  }

  const activeCount = activeRows.length;
  const completedCount = completedRows.length;

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">MILESTONES</h2>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            {activeCount} active • {completedCount} completed
          </div>
        </div>

        <div className="w-[200px]">
          <BrutalButton variant="outline" onClick={() => setIsMilestoneModalOpen(true)}>
            <span className="inline-flex items-center gap-2 text-sm">
              <span className="text-base leading-none">+</span>
              ADD MILESTONE
            </span>
          </BrutalButton>
        </div>
      </div>

      {error && (
        <div className="text-xs font-semibold uppercase tracking-widest text-red-600">
          {error}
        </div>
      )}

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
                onToggleChecked={() =>
                  console.log("[milestone] toggle checked:", m.id)
                }
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
                onToggleChecked={() =>
                  console.log("[milestone] toggle checked:", m.id)
                }
                onAddLog={() => console.log("[milestone] add log:", m.id)}
                onDelete={() => handleDeleteMilestone(m.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder text="No completed milestones yet" />
        )}
      </div>

      {/* MODAL */}
      <MilestoneModal
        open={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onCreate={handleCreateMilestone}
      />

      {(creating || deletingId) && (
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          {creating ? "Creating…" : "Deleting…"}
        </div>
      )}
    </section>
  );
}