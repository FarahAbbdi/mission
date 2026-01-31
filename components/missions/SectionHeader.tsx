"use client";

type Props = {
  title: string;
};

export default function SectionHeader({ title }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-3xl font-black tracking-tight">
        {title}
      </h2>

      <div className="w-full border-b-2 border-black" />
    </div>
  );
}