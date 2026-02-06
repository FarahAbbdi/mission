"use client";

import { useEffect, useMemo, useState } from "react";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { TextInput } from "@/components/ui/TextInput";

export type CreateWatcherPayload = { email: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateWatcherPayload) => Promise<void> | void;
  loading?: boolean;
};

export default function WatcherModal({
  open,
  onClose,
  onCreate,
  loading = false,
}: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return false;
    if (!trimmed.includes("@")) return false;
    return !loading;
  }, [email, loading]);

  // reset when opening
  useEffect(() => {
    if (!open) return;
    setEmail("");
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
      setError("Please enter a valid email.");
      return;
    }

    try {
      await onCreate({ email: email.trim() });
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={() => {
          if (loading) return;
          onClose();
        }}
        className="absolute inset-0 bg-black/70"
      />

      {/* Centered modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-[720px]">
          {/* brutal shadow */}
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />

          <div className="relative z-10 border-4 border-black bg-white overflow-hidden">
            <div className="max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-7 py-6">
                <h2 className="text-3xl font-black tracking-tight">ADD WATCHER</h2>

                <button
                  type="button"
                  onClick={() => {
                    if (loading) return;
                    onClose();
                  }}
                  className="h-11 w-11 border-3 border-black grid place-items-center hover:bg-black hover:text-white transition-colors text-2xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="border-b-4 border-black" />

              {/* Body */}
              <div className="flex-1 overflow-y-auto scrollbar-none px-7 py-7 space-y-6">
                <TextInput
                  label="Watcher Email *"
                  type="email"
                  placeholder="e.g. alex@gmail.com"
                  value={email}
                  onChange={setEmail}
                  name="watcher_email"
                  required
                />

                {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                  This user must already have an account.
                </p>
              </div>

              {/* Footer */}
              <div className="border-t-4 border-black" />
              <div className="px-7 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <BrutalButton
                    type="button"
                    variant="solid"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                  >
                    {loading ? "ADDING…" : "ADD WATCHER"}
                  </BrutalButton>

                  <BrutalButton
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                  >
                    CANCEL
                  </BrutalButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}