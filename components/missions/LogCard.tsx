"use client";

type Props = {
  createdAtISO: string;
  content: string;
};

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function formatLogTimestamp(iso: string) {
  // Supabase gives ISO; show "DD/MM/YYYY, HH:MM:SS"
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function LogCard({ createdAtISO, content }: Props) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
      <div className="relative z-10 w-full border-2 border-black bg-white px-6 py-5">
        <div className="flex items-center gap-3 text-gray-600">
          <ClockIcon />
          <div className="text-sm font-semibold">{formatLogTimestamp(createdAtISO)}</div>
        </div>

        <div className="mt-4 text-lg font-medium text-black">{content}</div>
      </div>
    </div>
  );
}