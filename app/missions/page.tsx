import MissionControlHeader from "@/components/missions/MissionControlHeader";

export default function MissionsPage() {
  return (
    <main className="px-12 py-8 space-y-6">
      <MissionControlHeader />

      {/* Thick divider */}
      <div className="w-full border-b-5 border-black" />
    </main>
  );
}