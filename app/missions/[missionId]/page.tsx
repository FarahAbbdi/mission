import MissionDetailTopBar from "@/components/missions/MissionDetailTopBar";

export default function MissionDetailPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="px-12">
        <MissionDetailTopBar />
      </div>

      {/* Main content area: always fills remaining viewport height */}
      <section className="relative flex-1">
        {/* Full-height right-side background (always visible) */}
        <div
          className="
            absolute inset-y-0
            left-[38%]
            right-0
            bg-gray-50
            pointer-events-none
          "
        />

        {/* Full-height vertical divider (always visible) */}
        <div
          className="
            absolute inset-y-0
            left-[38%]
            w-[4px]
            bg-black
            pointer-events-none
          "
        />

        {/* Actual content columns */}
        <div className="h-full px-12">
          <div className="flex h-full">
            {/* Left column */}
            <div className="w-[38%] pr-10">
              {/* content later */}
            </div>

            {/* Right column */}
            <div className="flex-1 pl-10">
              {/* content later */}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}