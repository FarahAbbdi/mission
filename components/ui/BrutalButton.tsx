"use client";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "solid" | "outline";
};

export function BrutalButton({
  children,
  onClick,
  type = "button",
  variant = "solid",
}: Props) {
  const solid = variant === "solid";

  return (
    <div className="relative group w-full">
      {/* brutal shadow layer */}
      <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" />

      <button
        type={type}
        onClick={onClick}
        className={`
          relative z-10 w-full
          px-6 py-3
          font-semibold uppercase tracking-wide
          flex items-center justify-center gap-2
          border-2 border-black
          transition-colors
          ${
            solid
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-black hover:text-white"
          }
        `}
      >
        {children}
      </button>
    </div>
  );
}