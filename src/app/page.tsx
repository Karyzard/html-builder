import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UploadProject from "./upload-project";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, theme_mode, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Projekty</h1>
        <p className="mt-1 text-sm text-slate-600">
          Nahraj složku s HTML prototypem a začni skládat sekce.
        </p>
      </section>

      <UploadProject />

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
          Tvoje projekty
        </h2>

        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Chyba načítání: {error.message}
          </p>
        )}

        {!error && projects && projects.length === 0 && (
          <p className="rounded border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            Žádné projekty. Nahraj první složku výš.
          </p>
        )}

        {!error && projects && projects.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}`}
                  className="block rounded border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-400"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Theme: {p.theme_mode} ·{" "}
                    {new Date(p.created_at).toLocaleString("cs")}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
