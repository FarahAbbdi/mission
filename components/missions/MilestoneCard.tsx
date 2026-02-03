"use client";

import { BrutalButton } from "@/components/ui/BrutalButton";

type Props = {
  title: string;
  subtitle?: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
  deadlineText: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  logsCount?: number;
  checked?: boolean;
  onToggleChecked?: () => void;
  onAddLog?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
};

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M7 4v3M17 4v3" stroke="currentColor" strokeWidth="2" />
      <path d="M5 9h14" stroke="currentColor" strokeWidth="2" />
      <path d="M6 6h12v14H6V6Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M6 7h12" stroke="currentColor" strokeWidth="2" />
      <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 7l1 14h6l1-14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function StatusPill({ status }: { status: Props["status"] }) {
  return (
    <div
      className="
        self-start
        inline-flex
        items-center
        border-2 border-black
        px-4 py-1.5
        text-[9px] font-black uppercase tracking-widest
        leading-none
        bg-white
      "
    >
      {status}
    </div>
  );
}

function PriorityPill({ priority }: { priority: Props["priority"] }) {
  return (
    <div className="border border-black px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
      {priority}
    </div>
  );
}

function CheckBox({ checked, onToggle }: { checked?: boolean; onToggle?: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
      className={[
        "h-7 w-7 border-2 border-black grid place-items-center",
        checked ? "bg-black text-white" : "bg-white text-black",
      ].join(" ")}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      )}
    </button>
  );
}

export default function MilestoneCard({
  title,
  subtitle = "Recruit 10 beta testers",
  status,
  deadlineText,
  priority,
  logsCount = 0,
  checked,
  onToggleChecked,
  onAddLog,
  onDelete,
  onClick,
}: Props) {
  return (
    <div className="relative w-full">
      {/* permanent brutal shadow */}
      <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />

      <div
        onClick={onClick}
        className="relative z-10 w-full border-2 border-black bg-white"
      >
        {/* TOP */}
        <div className="px-5 py-4">
          <div className="flex justify-between gap-2">
            <div className="flex gap-4">
              <CheckBox checked={checked} onToggle={onToggleChecked} />

              <div className="space-y-1">
                <div className="text-lg font-black leading-tight">{title}</div>
                <div className="text-sm text-gray-600">{subtitle}</div>

                <div className="pt-1.5 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon />
                    <span className="font-semibold">{deadlineText}</span>
                  </div>

                  <PriorityPill priority={priority} />

                  <div className="flex items-center gap-2 text-gray-600">
                    <ChevronRight />
                    <span className="font-semibold">
                      {logsCount} log{logsCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <StatusPill status={status} />
          </div>
        </div>

        <div className="border-t-2 border-black" />

        {/* ADD LOG */}
        <div className="px-5 py-4">
          <BrutalButton variant="outline">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <span className="text-base">+</span>
              ADD LOG
            </span>
          </BrutalButton>
        </div>

        <div className="border-t-2 border-black" />

        {/* DELETE */}
        <div className="px-5 py-4">
          <BrutalButton variant="outline">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <TrashIcon />
              DELETE MILESTONE
            </span>
          </BrutalButton>
        </div>
      </div>
    </div>
  );
}