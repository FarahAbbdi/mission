"use client";

type Props = {
  label: string;
};

export default function EmptyPlaceholder({ label }: Props) {
  return (
    <div className="w-full max-w-[520px] border-2 border-dashed border-gray-300 py-14 flex items-center justify-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </p>
    </div>
  );
}