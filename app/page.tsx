"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [status, setStatus] = useState("Checking Supabase...");

  useEffect(() => {
    (async () => {
      const { error } = await supabase.auth.getSession();
      setStatus(error ? `Supabase error: ${error.message}` : "Supabase connected ✅");
    })();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Mission</h1>
      <p className="mt-2">{status}</p>
    </main>
  );
}