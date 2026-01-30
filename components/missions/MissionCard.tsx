"use client";

type Props = {
  title: string;
  status: "ACTIVE" | "COMPLETED" | "UNSATISFIED" | "EXPIRED";
  milestonesText: string;
  dateRangeText: string;
  watchers?: string[];
  onClick?: () => void;
};

function StatusPill({ status }: { status: Props["status"] }) {
  const base =
    "border border-black px-3 py-1 text-[11px] font-bold uppercase tracking-widest";
  const filled = status === "COMPLETED";

  return (
    <div className={`${base} ${filled ? "bg-black text-white" : "bg-white text-black"}`}>
      {status}
    </div>
  );
}

function IconTarget() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M16 19c0-2-2-3-4-3s-4 1-4 3" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M20 19c0-1.6-1-2.6-2.4-3" stroke="currentColor" strokeWidth="2" />
      <path d="M6.4 16c-1.4.4-2.4 1.4-2.4 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function WatcherChip({ label }: { label: string }) {
  return (
    <div className="h-10 w-10 border-2 border-black flex items-center justify-center text-sm font-bold">
      {label}
    </div>
  );
}

export default function MissionCard({
  title,
  status,
  milestonesText,
  dateRangeText,
  watchers = [],
  onClick,
}: Props) {
  return (
    <div className="relative group w-full max-w-[420px]">
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 group-hover:translate-x-3 group-hover:translate-y-3 transition-all" />

      <button
        type="button"
        onClick={onClick}
        className="relative z-10 w-full text-left border-2 border-black bg-white px-6 py-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl font-black leading-tight group-hover:underline">
            {title}
          </h3>
          <StatusPill status={status} />
        </div>

        {/* Details */}
        <div className="mt-6 space-y-4 text-base">
          <div className="flex items-center gap-3">
            <IconTarget />
            <span className="font-semibold">{milestonesText}</span>
          </div>

          <div className="flex items-center gap-3">
            <IconClock />
            <span className="font-semibold">{dateRangeText}</span>
          </div>

          <div className="flex items-center gap-3">
            <IconUsers />
            <div className="flex items-center gap-3">
              {watchers.map((w) => (
                <WatcherChip key={w} label={w} />
              ))}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}