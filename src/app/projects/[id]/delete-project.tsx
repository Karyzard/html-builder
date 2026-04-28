"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "projects";

export default function DeleteProject({ projectId }: { projectId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Smazat projekt včetně všech stránek a snapshotů?")) return;

    setBusy(true);
    const supabase = createClient();

    // Smaž všechny soubory v bucket folderu (Supabase nemaže rekurzivně z DB cascade)
    const { data: files } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(`${projectId}`, { limit: 1000 });

    if (files && files.length > 0) {
      const paths = files.map((f) => `${projectId}/${f.name}`);
      await supabase.storage.from(STORAGE_BUCKET).remove(paths);
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      alert(`Chyba mazání: ${error.message}`);
      setBusy(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="rounded border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {busy ? "Mažu…" : "Smazat projekt"}
    </button>
  );
}
