"use client";

import { useEffect, useMemo, useState } from "react";
import { BrutalButton } from "@/components/ui/BrutalButton";

export type CreateLogPayload = { content: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate?: (payload: CreateLogPayload) => Promise<void> | void;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-black uppercase tracking-widest text-gray-600">
      {children}
    </div>
  );
}

export default function LogModal({ open, onClose, onCreate }: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => content.trim().length > 0, [content]);

  // reset when opening
  useEffect(() => {
    if (!open) return;
    setContent("");
    setSubmitting(false);
    setError(null);
  }, [open]);

  // Escape closes
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit() {
    setError(null);

    if (!canSubmit) {
      setError("Please fill the required field.");
      return;
    }

    try {
      setSubmitting(true);

      await onCreate?.({ content: content.trim() });

      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(String(error) || "Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      {/* Centered modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-[720px]">
          {/* brutal shadow */}
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />

          {/* modal shell */}
          <div className="relative z-10 border-4 border-black bg-white overflow-hidden">
            {/* fixed height container */}
            <div className="max-h-[85vh] flex flex-col">
              {/* Header (fixed) */}
              <div className="flex items-center justify-between px-7 py-6">
                <h2 className="text-3xl font-black tracking-tight">ADD LOG</h2>

                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 w-11 border-3 border-black grid place-items-center hover:bg-black hover:text-white transition-colors text-2xl leading-none"
                  aria-label="Close"
                  disabled={submitting}
                >
                  ×
                </button>
              </div>

              <div className="border-b-4 border-black" />

              {/* Body (scrollable) */}
              <div className="flex-1 overflow-y-auto scrollbar-none px-7 py-7 space-y-3">
                <SectionLabel>LOG CONTENT *</SectionLabel>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your progress, achievements, or updates"
                  className="w-full border-[1.5px] border-black p-4 outline-none focus:border-black min-h-[160px] text-sm resize-none"
                  disabled={submitting}
                />

                {error && (
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                )}
              </div>

              {/* Footer (fixed) */}
              <div className="border-t-4 border-black" />
              <div className="px-7 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <BrutalButton
                    type="button"
                    variant="solid"
                    disabled={submitting || !canSubmit}
                    onClick={handleSubmit}
                  >
                    {submitting ? "SAVING…" : "SAVE LOG"}
                  </BrutalButton>

                  <BrutalButton
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    CANCEL
                  </BrutalButton>
                </div>
              </div>
            </div>
            {/* end max-h container */}
          </div>
        </div>
      </div>
    </div>
  );
}