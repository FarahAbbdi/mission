"use client";

import { useMemo, useState } from "react";
import { BrutalButton } from "@/components/ui/BrutalButton";
import LogCard from "@/components/missions/LogCard";

type LogRowUI = {
  id: string;
  content: string;
  created_at: string; // ISO
};

type Props = {
  title: string;
  subtitle?: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "UNSATISFIED";
  deadlineText: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  logs?: LogRowUI[];
  logsCount?: number;
  checked?: boolean;
  isLocked?: boolean;

  onToggleChecked?: () => void;
  onAddLog?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
};

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4v3M17 4v3" stroke="currentColor" strokeWidth="2" />
      <path d="M5 9h14" stroke="currentColor" strokeWidth="2" />
      <path d="M6 6h12v14H6V6Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 7h12" stroke="currentColor" strokeWidth="2" />
      <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 7l1 14h6l1-14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function StatusPill({ status }: { status: Props["status"] }) {
  const filled = status === "COMPLETED";
  return (
    <div
      className={[
        "shrink-0 inline-flex items-center whitespace-nowrap leading-none",
        "border-2 border-black px-4 py-1.5 text-[9px] font-black uppercase tracking-widest",
        filled ? "bg-black text-white" : "bg-white text-black",
      ].join(" ")}
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

function CheckBox({
  checked,
  onToggle,
}: {
  checked?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={checked ? "Mark incomplete" : "Mark complete"}
      onClick={onToggle}
      className={[
        "h-7 w-7 border-2 border-black grid place-items-center shrink-0",
        checked ? "bg-black text-white" : "bg-white text-black",
      ].join(" ")}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      )}
    </button>
  );
}

export default function MilestoneCard({
  title,
  subtitle,
  status,
  deadlineText,
  priority,
  logs = [],
  logsCount,
  checked,
  isLocked = false,
  onToggleChecked,
  onAddLog,
  onDelete,
  onClick,
}: Props) {
  const [openLogs, setOpenLogs] = useState(false);

  const count = useMemo(
    () => (typeof logsCount === "number" ? logsCount : logs.length),
    [logs.length, logsCount]
  );

  const showCheckbox = !isLocked && status === "ACTIVE";
  const showAddLog = !isLocked && (status === "ACTIVE" || status === "COMPLETED");

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />

      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : -1}
        onClick={onClick}
        className="relative z-10 w-full border-2 border-black bg-white"
      >
        {/* TOP */}
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-4 min-w-0">
              {showCheckbox && (
                <CheckBox checked={checked} onToggle={onToggleChecked} />
              )}

              <div className="space-y-1 min-w-0">
                <div className="text-lg font-black truncate">{title}</div>

                {subtitle ? (
                  <div className="text-sm text-gray-600 break-words">{subtitle}</div>
                ) : null}

                <div className="pt-1.5 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon />
                    <span className="font-semibold">{deadlineText}</span>
                  </div>

                  <PriorityPill priority={priority} />

                  <button
                    type="button"
                    onClick={() => setOpenLogs((v) => !v)}
                    className="flex items-center gap-2 text-gray-600 hover:text-black"
                    aria-expanded={openLogs}
                  >
                    {openLogs ? <ChevronDown /> : <ChevronRight />}
                    <span className="font-semibold">
                      {count} log{count === 1 ? "" : "s"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <StatusPill status={status} />
          </div>
        </div>

        {/* ADD LOG (always visible for ACTIVE/COMPLETED when not locked) */}
        {showAddLog && (
          <>
            <div className="border-t-2 border-black" />
            <div className="px-5 py-4">
              <BrutalButton variant="outline" onClick={onAddLog}>
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                  <span className="text-base">+</span>
                  ADD LOG
                </span>
              </BrutalButton>
            </div>
          </>
        )}

        {/* EXPANDED LOGS */}
        {openLogs && (
          <>
            <div className="border-t-2 border-black" />
            <div className="px-5 py-6 space-y-6">
              {logs.length ? (
                logs.map((l) => (
                  <LogCard key={l.id} createdAtISO={l.created_at} content={l.content} />
                ))
              ) : (
                <div className="border-2 border-dashed border-gray-300 px-6 py-10 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    No logs entries
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* DELETE (always visible) */}
        {onDelete && (
          <>
            <div className="border-t-2 border-black" />
              <div className="px-5 py-4">
                <BrutalButton variant="outline" onClick={onDelete}>
                    <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                    <TrashIcon />
                    DELETE MILESTONE
                    </span>
                </BrutalButton>
                </div>
            </>     
         )}
      </div>
    </div>
  );
}