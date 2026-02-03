"use client";

import { useMemo, useState } from "react";
import { BrutalButton } from "@/components/ui/BrutalButton";
import MilestoneCard from "@/components/missions/MilestoneCard";
import MilestoneModal, {
  CreateMilestonePayload,
} from "@/components/missions/MilestoneModal";

type Props = {
  onAddMilestone?: () => void;
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

type DummyMilestone = {
  id: string;
  title: string;
  subtitle?: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
  deadlineText: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  logsCount?: number;
  checked?: boolean;
};

function isoToDMY(iso: string) {
  // "YYYY-MM-DD" -> "DD/MM/YYYY"
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function priorityToCard(p: "low" | "medium" | "high"): "LOW" | "MEDIUM" | "HIGH" {
  if (p === "low") return "LOW";
  if (p === "high") return "HIGH";
  return "MEDIUM";
}

export default function MilestonesSection({ onAddMilestone }: Props) {
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  // ✅ keep your dummy state, but store it in state so we can add to it on submit
  const [activeMilestones, setActiveMilestones] = useState<DummyMilestone[]>([
    {
      id: "m1",
      title: "User Testing Round 1",
      subtitle: "Recruit 10 beta testers",
      status: "ACTIVE",
      deadlineText: "01/02/2026",
      priority: "HIGH",
      logsCount: 1,
      checked: false,
    },
    {
      id: "m2",
      title: "Launch Marketing Campaign",
      subtitle: "Social media, email, blog posts",
      status: "ACTIVE",
      deadlineText: "08/02/2026",
      priority: "MEDIUM",
      logsCount: 0,
      checked: false,
    },
  ]);

  const [completedMilestones, setCompletedMilestones] = useState<DummyMilestone[]>([]);

  const activeCount = useMemo(() => activeMilestones.length, [activeMilestones]);
  const completedCount = useMemo(() => completedMilestones.length, [completedMilestones]);

  async function handleCreateMilestone(payload: CreateMilestonePayload) {
    console.group("[createMilestone]");
    console.log("payload from modal:", payload);

    // ✅ demo behavior: insert into ACTIVE list immediately so you can see it
    // later replace this with Supabase insert, then reload milestones
    const newItem: DummyMilestone = {
      id: `tmp_${Date.now()}`,
      title: payload.name,
      subtitle: payload.notes || undefined,
      status: "ACTIVE",
      deadlineText: isoToDMY(payload.deadline),
      priority: priorityToCard(payload.priority),
      logsCount: 0,
      checked: false,
    };

    console.log("optimistically adding dummy milestone:", newItem);
    setActiveMilestones((prev) => [newItem, ...prev]);

    console.groupEnd();
    setIsMilestoneModalOpen(false);
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">MILESTONES</h2>
          {/* optional tiny debug count */}
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            {activeCount} active • {completedCount} completed
          </div>
        </div>

        <div className="w-[200px]">
          <BrutalButton
            variant="outline"
            onClick={() => {
              console.log("[ui] ADD MILESTONE click");
              onAddMilestone?.(); // keep your hook for the page
              setIsMilestoneModalOpen(true);
            }}
          >
            <span className="inline-flex items-center gap-2 text-sm">
              <span className="text-base leading-none">+</span>
              ADD MILESTONE
            </span>
          </BrutalButton>
        </div>
      </div>

      {/* ACTIVE */}
      <div className="space-y-4">
        <SectionLabel>ACTIVE</SectionLabel>

        {activeMilestones.length ? (
          <div className="space-y-6">
            {activeMilestones.map((m) => (
              <MilestoneCard
                key={m.id}
                title={m.title}
                subtitle={m.subtitle}
                status={m.status}
                deadlineText={m.deadlineText}
                priority={m.priority}
                logsCount={m.logsCount ?? 0}
                checked={m.checked}
                onToggleChecked={() =>
                  console.log("[milestone] toggle checked:", m.id)
                }
                onAddLog={() => console.log("[milestone] add log:", m.id)}
                onDelete={() => console.log("[milestone] delete:", m.id)}
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

        {completedMilestones.length ? (
          <div className="space-y-6">
            {completedMilestones.map((m) => (
              <MilestoneCard
                key={m.id}
                title={m.title}
                subtitle={m.subtitle}
                status={m.status}
                deadlineText={m.deadlineText}
                priority={m.priority}
                logsCount={m.logsCount ?? 0}
                checked={m.checked ?? true}
                onToggleChecked={() =>
                  console.log("[milestone] toggle checked:", m.id)
                }
                onAddLog={() => console.log("[milestone] add log:", m.id)}
                onDelete={() => console.log("[milestone] delete:", m.id)}
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
        onClose={() => {
          console.log("[ui] milestone modal close");
          setIsMilestoneModalOpen(false);
        }}
        onCreate={handleCreateMilestone}
      />
    </section>
  );
}