"use client";

import { BrutalButton } from "@/components/ui/BrutalButton";

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
    <div className="border-2 border-dashed border-gray-300 px-6 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {text}
      </p>
    </div>
  );
}

export default function MilestonesSection({ onAddMilestone }: Props) {
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
        <EmptyPlaceholder text="No active milestones yet" />
      </div>

      {/* COMPLETED */}
      <div className="space-y-4">
        <SectionLabel>COMPLETED</SectionLabel>
        <EmptyPlaceholder text="No completed milestones yet" />
      </div>
    </section>
  );
}