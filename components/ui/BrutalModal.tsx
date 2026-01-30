"use client";

type Props = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function BrutalModal({ open, title, children, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="relative w-full max-w-[920px]">
          {/* brutal shadow */}
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />

          <div className="relative z-10 border-2 border-black bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-7">
              <h2 className="text-3xl font-black tracking-tight">{title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="h-12 w-12 border-2 border-black flex items-center justify-center text-2xl leading-none hover:bg-black hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Thick divider */}
            <div className="border-b-4 border-black" />

            {/* Content */}
            <div className="px-10 py-10">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}