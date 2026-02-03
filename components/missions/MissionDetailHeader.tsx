"use client";

import { BrutalButton } from "@/components/ui/BrutalButton";

type Props = {
  statusLabel?: string; // e.g. "ACTIVE"
  title: string;

  startDateText?: string; // e.g. "Jan 4, 2026"
  endDateText?: string; // e.g. "Apr 4, 2026"
  description?: string;

  watchers?: { initial: string; name: string }[];

  onAddWatcher?: () => void;
  onMarkSatisfied?: () => void;
  onDeleteMission?: () => void;
};

function StatusPill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
      {label}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
      {children}
    </div>
  );
}

function CardBox({ children }: { children: React.ReactNode }) {
  return <div className="border-2 border-black bg-gray-50 px-4 py-3">{children}</div>;
}

function DateStack({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  return (
    <div className="border-2 border-black bg-white">
      {/* START */}
      <div className="px-4 py-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Start date
        </div>
        <div className="mt-0.5 text-lg font-semibold leading-tight">
          {start}
        </div>
      </div>

      <div className="border-t-2 border-black" />

      {/* END */}
      <div className="px-4 py-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          End date
        </div>
        <div className="mt-0.5 text-lg font-semibold leading-tight">
          {end}
        </div>
      </div>
    </div>
  );
}

function WatcherChip({ initial, name }: { initial: string; name: string }) {
  return (
    <div className="border-2 border-black px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="text-[10px] font-black uppercase">{initial}</div>
        <div className="text-sm font-black">{name}</div>
      </div>
    </div>
  );
}

function UserPlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 19c0-2.2-2-3.5-4-3.5S7 16.8 7 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
      <circle cx="11" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M18 8v6M15 11h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path
        d="M8 7l1 14h6l1-14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

export default function MissionDetailHeader({
  statusLabel = "ACTIVE",
  title,

  startDateText = "Jan 4, 2026",
  endDateText = "Apr 4, 2026",
  description = "Complete product launch including marketing campaign, documentation, and user onboarding.",

  watchers = [
    { initial: "A", name: "Alice" },
    { initial: "B", name: "Bob" },
  ],

  onAddWatcher,
  onMarkSatisfied,
  onDeleteMission,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Status + Title */}
      <div className="space-y-3">
        <StatusPill label={statusLabel} />
        <h1 className="text-4xl font-black tracking-tight leading-[1.05]">
          {title}
        </h1>
      </div>

      {/* DATES (new design) */}
      <div className="space-y-2">
        <DateStack start={startDateText} end={endDateText} />
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2">
        <SectionLabel>DESCRIPTION</SectionLabel>
        <CardBox>
          <p className="text-sm leading-relaxed">{description}</p>
        </CardBox>
      </div>

      {/* WATCHERS */}
      <div className="space-y-2">
        <SectionLabel>WATCHERS</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {watchers.map((w) => (
            <WatcherChip key={`${w.initial}-${w.name}`} initial={w.initial} name={w.name} />
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="space-y-3 pt-1">
        <BrutalButton variant="solid" onClick={onAddWatcher}>
          <span className="inline-flex items-center gap-2 text-sm">
            <UserPlusIcon />
            ADD WATCHER
          </span>
        </BrutalButton>

        <BrutalButton variant="solid" onClick={onMarkSatisfied}>
          <span className="inline-flex items-center gap-2 text-sm">
            <CheckIcon />
            MARK AS SATISFIED
          </span>
        </BrutalButton>

        <BrutalButton variant="outline" onClick={onDeleteMission}>
          <span className="inline-flex items-center gap-2 text-sm">
            <TrashIcon />
            DELETE MISSION
          </span>
        </BrutalButton>
      </div>
    </div>
  );
}