"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SECTIONS, type SectionDef } from "@/lib/sections";
import { insertSection } from "@/lib/html-edit";
import { contentTypeFor } from "@/lib/mime";

const STORAGE_BUCKET = "projects";

type Props = {
  pageId: number;
  storagePath: string;
  previewUrl: string | null;
};

type Status =
  | { kind: "idle" }
  | { kind: "saving"; section: string }
  | { kind: "saved"; section: string }
  | { kind: "error"; message: string };

export default function SectionEditor({
  pageId,
  storagePath,
  previewUrl,
}: Props) {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [iframeKey, setIframeKey] = useState(0);

  async function handleInsert(section: SectionDef) {
    const supabase = createClient();
    setStatus({ kind: "saving", section: section.name });

    // 1. Stáhni aktuální HTML ze Storage
    const { data: blob, error: downloadErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(storagePath);

    if (downloadErr || !blob) {
      setStatus({
        kind: "error",
        message: `Načtení HTML selhalo: ${downloadErr?.message ?? "neznámá chyba"}`,
      });
      return;
    }

    const originalHtml = await blob.text();

    // 2. Snapshot do DB před úpravou
    const { error: snapshotErr } = await supabase.from("snapshots").insert({
      page_id: pageId,
      html_content: originalHtml,
      note: `Před vložením: ${section.name}`,
    });

    if (snapshotErr) {
      setStatus({
        kind: "error",
        message: `Snapshot selhal: ${snapshotErr.message}`,
      });
      return;
    }

    // 3. Vlož sekci a uploadni zpět
    const newHtml = insertSection(originalHtml, section.html);

    const contentType = contentTypeFor(storagePath);
    const { error: uploadErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, new Blob([newHtml], { type: contentType }), {
        upsert: true,
        contentType,
        cacheControl: "0",
      });

    if (uploadErr) {
      setStatus({
        kind: "error",
        message: `Upload selhal: ${uploadErr.message}`,
      });
      return;
    }

    // 4. Update last_edited_at
    await supabase
      .from("pages")
      .update({ last_edited_at: new Date().toISOString() })
      .eq("id", pageId);

    // 5. Refresh iframe (cache-bust přes klíč) + server data
    setIframeKey((k) => k + 1);
    setStatus({ kind: "saved", section: section.name });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setEditMode((v) => !v)}
          className={`rounded px-3 py-1.5 text-sm font-medium transition ${
            editMode
              ? "bg-indigo-600 text-white hover:bg-indigo-500"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {editMode ? "Ukončit edit" : "Edit mode"}
        </button>

        {status.kind === "saving" && (
          <span className="text-sm text-slate-600">
            Vkládám {status.section}…
          </span>
        )}
        {status.kind === "saved" && (
          <span className="text-sm text-emerald-700">
            Vloženo: {status.section}
          </span>
        )}
        {status.kind === "error" && (
          <span className="text-sm text-red-700">{status.message}</span>
        )}
      </div>

      <div
        className={`grid gap-4 ${editMode ? "grid-cols-[260px_1fr]" : "grid-cols-1"}`}
      >
        {editMode && (
          <aside className="rounded border border-slate-200 bg-white p-3">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Knihovna sekcí
            </h3>
            <ul className="space-y-1">
              {SECTIONS.map((section) => (
                <li key={section.slug}>
                  <button
                    onClick={() => handleInsert(section)}
                    disabled={status.kind === "saving"}
                    className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-slate-100 disabled:opacity-50"
                  >
                    <div className="font-medium">{section.name}</div>
                    <div className="text-xs text-slate-500">
                      {section.category}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Sekce se vkládají před <code>&lt;/body&gt;</code>. Před každým
              vložením se uloží snapshot.
            </p>
          </aside>
        )}

        <div className="overflow-hidden rounded border border-slate-200 bg-white">
          {previewUrl ? (
            <iframe
              key={iframeKey}
              src={`${previewUrl}?v=${iframeKey}`}
              sandbox="allow-same-origin allow-scripts"
              className="h-[80vh] w-full"
              title="Preview"
            />
          ) : (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Preview není dostupný.
            </p>
          )}
        </div>
      </div>

      {editMode && (
        <p className="text-xs text-slate-500">
          Sekce z knihovny používají Tailwind classes. Pokud preview nemá
          načtený Tailwind, nebudou vypadat správně — přidej do{" "}
          <code>&lt;head&gt;</code> stránky{" "}
          <code>
            &lt;script src=&quot;https://cdn.tailwindcss.com&quot;&gt;&lt;/script&gt;
          </code>
          .
        </p>
      )}
    </div>
  );
}
