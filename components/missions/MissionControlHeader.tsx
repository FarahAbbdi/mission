"use client";

type Props = {
  onNewMission?: () => void;
  onLogout?: () => void;
};

function BrutalHeaderButton({
  widthClass,
  variant,
  onClick,
  icon,
  children,
}: {
  widthClass: string;
  variant: "solid" | "outline";
  onClick?: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const baseButton =
    "relative z-10 w-full border-2 border-black px-6 py-3 sm:px-7 sm:py-3.5 text-base font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-3 sm:gap-4";

  const variantClass =
    variant === "solid"
      ? "bg-black text-white hover:bg-white hover:text-black"
      : "bg-white text-black hover:bg-black hover:text-white";

  return (
    <div className={`relative group ${widthClass}`}>
      <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" />

      <button
        type="button"
        onClick={onClick}
        className={`${baseButton} ${variantClass}`}
      >
        {icon}
        <span className="whitespace-nowrap">{children}</span>
      </button>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M4 5v14M4 5h7M4 19h7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
      <path
        d="M11 12h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
      <path
        d="M17 8l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}

export default function MissionControlHeader({
  onNewMission,
  onLogout,
}: Props) {
  return (
    <header
      className="
        w-full
        flex flex-col items-center text-center gap-6
        sm:flex-row sm:items-center sm:justify-between sm:text-left
      "
    >
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-[2.5rem] sm:text-5xl lg:text-6xl font-black tracking-tight">
          MISSION CONTROL
        </h1>

        <p className="text-base sm:text-lg lg:text-2xl text-gray-500">
          Track your progress. Achieve your goals.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
        <BrutalHeaderButton
          widthClass="w-full sm:w-[230px]"
          variant="solid"
          onClick={onNewMission}
          icon={<PlusIcon />}
        >
          NEW MISSION
        </BrutalHeaderButton>

        <BrutalHeaderButton
          widthClass="w-full sm:w-[180px]"
          variant="outline"
          onClick={onLogout}
          icon={<LogoutIcon />}
        >
          LOGOUT
        </BrutalHeaderButton>
      </div>
    </header>
  );
}