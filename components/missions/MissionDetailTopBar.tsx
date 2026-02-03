"use client";

import { useRouter } from "next/navigation";

type Props = {
  backHref?: string;
  label?: string;
};

function BackArrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M10 5L3 12L10 19"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M3 12H21"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
    </svg>
  );
}

export default function MissionDetailTopBar({
  backHref = "/missions",
  label = "BACK TO MISSION CONTROL",
}: Props) {
  const router = useRouter();

  return (
    <div className="pt-6 pb-6 space-y-6">
      {/* Back control */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(backHref)}
        className="
          group
          inline-flex items-center gap-2
          cursor-pointer
          select-none
        "
      >
        {/* Arrow — no hover effect */}
        <BackArrow />

        {/* Text — hover only here */}
        <span
          className="
            text-base
            font-black
            uppercase
            tracking-wide
            text-black
            transition-all
            group-hover:underline
            group-hover:translate-x-1
          "
        >
          {label}
        </span>
      </div>

      {/* Full-width divider */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b-4 border-black" />
    </div>
  );
}