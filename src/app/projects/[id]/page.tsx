import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteProject from "./delete-project";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) notFound();

  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, theme_mode, design_md, theme_css_path, created_at")
    .eq("id", projectId)
    .single();

  if (!project) notFound();

  const { data: pages } = await supabase
    .from("pages")
    .select("id, file_path, title, last_edited_at")
    .eq("project_id", projectId)
    .order("file_path");

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Projekty
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Theme: {project.theme_mode} ·{" "}
              {project.design_md ? "design.md ✓" : "design.md —"} ·{" "}
              {project.theme_css_path ? "theme.css ✓" : "theme.css —"}
            </p>
          </div>
          <DeleteProject projectId={project.id} />
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
          Stránky ({pages?.length ?? 0})
        </h2>

        {(!pages || pages.length === 0) && (
          <p className="rounded border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            V projektu nejsou žádné HTML soubory.
          </p>
        )}

        {pages && pages.length > 0 && (
          <ul className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
            {pages.map((page) => (
              <li key={page.id}>
                <Link
                  href={`/projects/${project.id}/pages/${page.id}`}
                  className="block px-4 py-3 transition hover:bg-slate-50"
                >
                  <div className="font-medium">{page.title}</div>
                  <div className="mt-0.5 font-mono text-xs text-slate-500">
                    {page.file_path}
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
