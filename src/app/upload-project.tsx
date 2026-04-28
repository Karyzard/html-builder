"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { contentTypeFor } from "@/lib/mime";

const STORAGE_BUCKET = "projects";

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; current: number; total: number }
  | { kind: "error"; message: string };

export default function UploadProject() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    // První segment cesty = root složka (název projektu)
    const firstPath = (files[0] as File & { webkitRelativePath: string })
      .webkitRelativePath;
    const rootName = firstPath.split("/")[0] || "projekt";

    const supabase = createClient();

    // Vytvoř projekt
    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .insert({
        name: rootName,
        storage_bucket: `${STORAGE_BUCKET}/__pending__`,
        theme_mode: "generic",
      })
      .select("id")
      .single();

    if (projectErr || !project) {
      setStatus({
        kind: "error",
        message: projectErr?.message ?? "Nepodařilo se vytvořit projekt.",
      });
      return;
    }

    const projectId = project.id;
    const bucketPath = `${projectId}`;

    await supabase
      .from("projects")
      .update({ storage_bucket: `${STORAGE_BUCKET}/${bucketPath}` })
      .eq("id", projectId);

    // Filtruj jen HTML, CSS, MD a obrázky
    const allowed = files.filter((f) => {
      const name = f.name.toLowerCase();
      return (
        name.endsWith(".html") ||
        name.endsWith(".css") ||
        name.endsWith(".md") ||
        name.endsWith(".js") ||
        name.endsWith(".png") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".webp") ||
        name.endsWith(".svg")
      );
    });

    setStatus({ kind: "uploading", current: 0, total: allowed.length });

    let designMd: string | null = null;
    let themeCssPath: string | null = null;
    const htmlFiles: { relativePath: string; file: File }[] = [];

    for (let i = 0; i < allowed.length; i++) {
      const file = allowed[i] as File & { webkitRelativePath: string };
      const fullPath = file.webkitRelativePath;
      const relative = fullPath.substring(rootName.length + 1);
      const storagePath = `${bucketPath}/${relative}`;

      const contentType = contentTypeFor(relative);
      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer], { type: contentType });
      const { error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, blob, {
          upsert: true,
          contentType,
          cacheControl: "0",
        });

      if (uploadErr) {
        setStatus({
          kind: "error",
          message: `Upload selhal pro ${relative}: ${uploadErr.message}`,
        });
        return;
      }

      if (relative.toLowerCase() === "design.md") {
        designMd = await file.text();
      }
      if (relative.toLowerCase().endsWith("theme.css") && !themeCssPath) {
        themeCssPath = storagePath;
      }
      if (relative.toLowerCase().endsWith(".html")) {
        htmlFiles.push({ relativePath: relative, file });
      }

      setStatus({
        kind: "uploading",
        current: i + 1,
        total: allowed.length,
      });
    }

    // Updatuj projekt s design_md / theme_css_path
    if (designMd || themeCssPath) {
      await supabase
        .from("projects")
        .update({
          design_md: designMd,
          theme_css_path: themeCssPath,
        })
        .eq("id", projectId);
    }

    // Vytvoř záznamy v `pages` pro HTML soubory
    if (htmlFiles.length > 0) {
      const titleFromHtml = async (file: File) => {
        const text = await file.text();
        const match = text.match(/<title>([^<]+)<\/title>/i);
        return match?.[1]?.trim() ?? null;
      };

      const pageRows = await Promise.all(
        htmlFiles.map(async ({ relativePath, file }) => ({
          project_id: projectId,
          file_path: relativePath,
          title: (await titleFromHtml(file)) ?? relativePath,
        }))
      );

      const { error: pagesErr } = await supabase.from("pages").insert(pageRows);

      if (pagesErr) {
        setStatus({
          kind: "error",
          message: `Soubory nahrané, ale index stránek selhal: ${pagesErr.message}`,
        });
        return;
      }
    }

    router.push(`/projects/${projectId}`);
    router.refresh();
  }

  const uploading = status.kind === "uploading";

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6">
      <label className="block">
        <span className="text-sm font-medium">Nahrát složku projektu</span>
        <input
          type="file"
          // @ts-expect-error — webkitdirectory není v React typech
          webkitdirectory=""
          directory=""
          multiple
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
          className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700 disabled:opacity-50"
        />
        <span className="mt-2 block text-xs text-slate-500">
          Vyber root složku tvého HTML prototypu. Nahrají se jen HTML, CSS, MD,
          JS a obrázky.
        </span>
      </label>

      {status.kind === "uploading" && (
        <p className="mt-3 text-sm text-slate-600">
          Nahrávám {status.current} / {status.total}…
        </p>
      )}
      {status.kind === "error" && (
        <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {status.message}
        </p>
      )}
    </div>
  );
}
