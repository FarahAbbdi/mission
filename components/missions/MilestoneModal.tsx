"use client";

import { useEffect, useMemo, useState } from "react";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { TextInput } from "@/components/ui/TextInput";

export type CreateMilestonePayload = {
  name: string;
  deadline: string; // YYYY-MM-DD
  notes?: string;
  priority: "low" | "medium" | "high";
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate?: (payload: CreateMilestonePayload) => Promise<void> | void;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-black uppercase tracking-widest text-gray-600">
      {children}
    </div>
  );
}

function PriorityButton({
  label,
  active,
  onClick,
}: {
  label: "LOW" | "MEDIUM" | "HIGH";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full border-2 border-black px-4 py-4 text-base font-black uppercase tracking-widest transition-colors",
        active ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function MilestoneModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!deadline) return false;
    return true;
  }, [name, deadline]);

  // reset when opening
  useEffect(() => {
    if (!open) return;
    setName("");
    setDeadline("");
    setNotes("");
    setPriority("medium");
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
      setError("Please fill the required fields.");
      return;
    }

    try {
      setSubmitting(true);

      await onCreate?.({
        name: name.trim(),
        deadline,
        notes: notes.trim() || undefined,
        priority,
      });

      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e) || "Something went wrong.");
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
                <h2 className="text-3xl font-black tracking-tight">
                  ADD MILESTONE
                </h2>

                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 w-11 border-3 border-black grid place-items-center hover:bg-black hover:text-white transition-colors text-2xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="border-b-4 border-black" />

              {/* Body (scrollable) */}
              <div className="flex-1 overflow-y-auto scrollbar-none px-7 py-7 space-y-6">
                <TextInput
                  label="Milestone Name *"
                  placeholder="Enter milestone name"
                  value={name}
                  onChange={setName}
                  name="milestone_name"
                  required
                />

                <TextInput
                  label="Deadline *"
                  type="date"
                  placeholder="Select deadline"
                  value={deadline}
                  onChange={setDeadline}
                  name="deadline"
                  required
                />

                <div className="space-y-2">
                  <SectionLabel>NOTES</SectionLabel>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add details or context"
                    className="w-full border-[1.5px] border-black p-4 outline-none focus:border-black min-h-[120px] text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <SectionLabel>PRIORITY</SectionLabel>
                  <div className="grid grid-cols-3 gap-4">
                    <PriorityButton
                      label="LOW"
                      active={priority === "low"}
                      onClick={() => setPriority("low")}
                    />
                    <PriorityButton
                      label="MEDIUM"
                      active={priority === "medium"}
                      onClick={() => setPriority("medium")}
                    />
                    <PriorityButton
                      label="HIGH"
                      active={priority === "high"}
                      onClick={() => setPriority("high")}
                    />
                  </div>
                </div>

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
                    CREATE MILESTONE
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