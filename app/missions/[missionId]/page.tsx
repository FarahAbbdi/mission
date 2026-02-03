"use client";

import MissionDetailTopBar from "@/components/missions/MissionDetailTopBar";
import MissionDetailHeader from "@/components/missions/MissionDetailHeader";
import MilestonesSection from "@/components/missions/MilestonesSection";

export default function MissionDetailPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="px-12">
        <MissionDetailTopBar />
      </div>

      {/* Main content */}
      <section className="relative flex-1">
        {/* Right-side background (BEHIND content) */}
        <div
          className="
            absolute inset-y-0
            left-[38%]
            right-0
            bg-gray-50
            z-0
          "
        />

        {/* Vertical divider */}
        <div
          className="
            absolute inset-y-0
            left-[38%]
            w-[4px]
            bg-black
            z-10
          "
        />

        {/* Content */}
        <div className="relative z-20 h-full px-12">
          <div className="flex h-full">
            {/* Left column */}
            <div className="w-[38%] pr-10 pt-10 space-y-10">
              <MissionDetailHeader
                title="Launch New Product"
                statusLabel="ACTIVE"
              />
            </div>

            {/* Right column */}
            <div className="flex-1 pl-10 pt-10">
              <MilestonesSection
                onAddMilestone={() =>
                  console.log("[ui] add milestone")
                }
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}