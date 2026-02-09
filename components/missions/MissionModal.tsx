"use client";

import { useEffect, useMemo, useState } from "react";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { TextInput } from "@/components/ui/TextInput";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate?: (payload: {
    name: string;
    startDate: string;
    endDate: string;
    description: string;
  }) => Promise<void> | void;
};

export default function MissionModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!startDate) return false;
    if (!endDate) return false;
    return true;
  }, [name, startDate, endDate]);

  useEffect(() => {
    if (!open) return;
    setName("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setError(null);
    setSubmitting(false);
  }, [open]);

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

    if (endDate < startDate) {
      setError("End date must be after start date.");
      return;
    }

    try {
      setSubmitting(true);

      await onCreate?.({
        name: name.trim(),
        startDate,
        endDate,
        description: description.trim(),
      });

      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Something went wrong.");
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
        className="absolute inset-0 bg-black/70"
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl">
          {/* brutal shadow */}
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />

          {/* shell */}
          <div className="relative z-10 border-4 border-black bg-white overflow-hidden">
            {/* Constrain height + enable internal scrolling */}
            <div className="max-h-[85vh] flex flex-col">
              {/* Header (fixed) */}
              <div className="flex items-center justify-between px-8 py-6">
                <h2 className="text-4xl font-black tracking-tight leading-none">
                  CREATE MISSION
                </h2>

                <button
                  type="button"
                  onClick={onClose}
                  className="h-12 w-12 border-2 border-black grid place-items-center hover:bg-black hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <span className="text-3xl leading-none block p-0 m-0">×</span>
                </button>
              </div>

              <div className="border-b-4 border-black" />

              {/* Body (scrollable) */}
              <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
                <TextInput
                  label="Mission Name *"
                  placeholder="Enter mission name"
                  value={name}
                  onChange={setName}
                  name="mission_name"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput
                    label="Start Date *"
                    type="date"
                    placeholder="Select start date"
                    value={startDate}
                    onChange={setStartDate}
                    name="start_date"
                    required
                  />

                  <TextInput
                    label="End Date *"
                    type="date"
                    placeholder="Select end date"
                    value={endDate}
                    onChange={setEndDate}
                    name="end_date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wide text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your mission"
                    className="w-full border-[1.5px] border-black p-4 outline-none focus:border-black min-h-[140px]"
                  />
                </div>

                {error && (
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                )}

                {/* Footer buttons (still inside body so it scrolls if needed) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div
                    className={
                      submitting || !canSubmit
                        ? "opacity-60 pointer-events-none"
                        : ""
                    }
                  >
                    <BrutalButton
                      type="button"
                      variant="solid"
                      onClick={handleSubmit}
                    >
                      {submitting ? "CREATING…" : "CREATE MISSION"}
                    </BrutalButton>
                  </div>

                  <div className={submitting ? "opacity-60 pointer-events-none" : ""}>
                    <BrutalButton type="button" variant="outline" onClick={onClose}>
                      CANCEL
                    </BrutalButton>
                  </div>
                </div>
              </div>
              {/* end scrollable body */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}