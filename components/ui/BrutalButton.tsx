"use client";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "solid" | "outline";
  disabled?: boolean;
  className?: string;
};

export function BrutalButton({
  children,
  onClick,
  type = "button",
  variant = "solid",
  disabled = false,
  className = "",
}: Props) {
  const solid = variant === "solid";

  return (
    <div
      className={`relative group w-full ${
        disabled ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* brutal shadow */}
      <div
        className={`
          absolute inset-0 bg-black
          translate-x-1 translate-y-1
          transition-transform
          ${disabled ? "" : "group-hover:translate-x-2 group-hover:translate-y-2"}
        `}
      />

      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`
          relative z-10 w-full
          px-6 py-3
          font-semibold uppercase tracking-wide
          flex items-center justify-center gap-2
          border-2 border-black
          transition-colors
          ${
            solid
              ? "bg-black text-white hover:bg-white hover:text-black"
              : "bg-white text-black hover:bg-black hover:text-white"
          }
          ${className}
        `}
      >
        {children}
      </button>
    </div>
  );
}