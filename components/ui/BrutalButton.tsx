type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

export function BrutalButton({
  children,
  onClick,
  disabled,
  type = "button",
}: Props) {
  return (
    <div className="relative w-full group">
      <div
        className="
          absolute inset-0 bg-black
          opacity-0 translate-x-0 translate-y-0
          transition-all duration-100
          group-hover:opacity-100
          group-hover:translate-x-2 group-hover:translate-y-2
        "
        aria-hidden="true"
      />

      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="
          relative z-10 w-full
          bg-black text-white font-semibold uppercase
          px-6 py-4
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
        "
      >
        {children}
      </button>
    </div>
  );
}