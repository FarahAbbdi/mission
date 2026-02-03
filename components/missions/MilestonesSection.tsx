"use client";

import { BrutalButton } from "@/components/ui/BrutalButton";
import MilestoneCard from "@/components/missions/MilestoneCard";

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

export default function MilestonesSection({ onAddMilestone }: Props) {
  // Dummy data for now (replace with Supabase later)
  const activeMilestones = [
    {
      id: "m1",
      title: "User Testing Round 1",
      subtitle: "Recruit 10 beta testers",
      status: "ACTIVE" as const,
      deadlineText: "01/02/2026",
      priority: "HIGH" as const,
      logsCount: 1,
      checked: false,
    },
    {
      id: "m2",
      title: "Launch Marketing Campaign",
      subtitle: "Social media, email, blog posts",
      status: "ACTIVE" as const,
      deadlineText: "08/02/2026",
      priority: "MEDIUM" as const,
      logsCount: 0,
      checked: false,
    },
  ];

  const completedMilestones: Array<{
    id: string;
    title: string;
    subtitle?: string;
    status: "COMPLETED";
    deadlineText: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    logsCount?: number;
    checked?: boolean;
  }> = [];

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <h2 className="text-3xl font-black tracking-tight">MILESTONES</h2>

        <div className="w-[200px]">
          <BrutalButton variant="outline" onClick={onAddMilestone}>
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
                logsCount={m.logsCount}
                checked={m.checked}
                onToggleChecked={() => console.log("[milestone] toggle checked:", m.id)}
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
                onToggleChecked={() => console.log("[milestone] toggle checked:", m.id)}
                onAddLog={() => console.log("[milestone] add log:", m.id)}
                onDelete={() => console.log("[milestone] delete:", m.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder text="No completed milestones yet" />
        )}
      </div>
    </section>
  );
}