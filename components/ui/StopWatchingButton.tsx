"use client";

import { BrutalButton } from "@/components/ui/BrutalButton";

type Props = {
  disabled?: boolean;
  onClick?: () => void;
};

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" />
      <path d="M10.6 10.6a3 3 0 004.2 4.2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12s3 7 10 7c1.1 0 2.1-.2 3-.5" stroke="currentColor" strokeWidth="2" />
      <path d="M9.9 5.4A10.7 10.7 0 0112 5c7 0 10 7 10 7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function StopWatchingButton({ disabled, onClick }: Props) {
  return (
    <BrutalButton variant="outline" onClick={onClick} disabled={disabled}>
      <span className="inline-flex items-center gap-2 text-sm">
        <EyeOffIcon />
        STOP WATCHING
      </span>
    </BrutalButton>
  );
}