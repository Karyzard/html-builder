import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SectionEditor from "./section-editor";

export const dynamic = "force-dynamic";

export default async function PageDetail({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>;
}) {
  const { id, pageId } = await params;
  const projectId = Number(id);
  const pageIdNum = Number(pageId);
  if (!Number.isInteger(projectId) || !Number.isInteger(pageIdNum)) notFound();

  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id, project_id, file_path, title")
    .eq("id", pageIdNum)
    .single();

  if (!page || page.project_id !== projectId) notFound();

  const storagePath = `${projectId}/${page.file_path}`;
  const previewUrl = `/api/files/${projectId}/${page.file_path}`;

  return (
    <div className="space-y-4">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Stránky projektu
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{page.title}</h1>
        <p className="mt-1 font-mono text-xs text-slate-500">
          {page.file_path}
        </p>
      </div>

      <SectionEditor
        pageId={page.id}
        storagePath={storagePath}
        previewUrl={previewUrl}
      />
    </div>
  );
}
