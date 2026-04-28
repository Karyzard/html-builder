import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "projects";

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
  const { data: publicData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  const previewUrl = publicData?.publicUrl ?? null;

  return (
    <div className="space-y-4">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← {page.file_path.split("/")[0]}
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{page.title}</h1>
        <p className="mt-1 font-mono text-xs text-slate-500">
          {page.file_path}
        </p>
      </div>

      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        {previewUrl ? (
          <iframe
            src={previewUrl}
            sandbox="allow-same-origin allow-scripts"
            className="h-[80vh] w-full"
            title={page.title ?? page.file_path}
          />
        ) : (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Preview není dostupný.
          </p>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Editor sekcí, modal editor, flow view a snapshoty přijdou v dalších
        feature PR.
      </p>
    </div>
  );
}
