# PRD: HTML Configurator

## Problém

Než začnu kódovat aplikaci v Next.js, potřebuji agentovi předat **kompletní klikací HTML prototyp** flow té aplikace. Dnes prototypy skládám ručně z jednorázových HTML souborů — je to pomalé, neumím rychle přidávat sekce z palety, neumím editovat modály a ztrácím přehled o tom, jak jsou stránky propojené.

## Cílový uživatel

Já (jeden developer) — solo dev nástroj pro fázi „building prototype" před implementací produkční appky.

## User Stories

- Jako dev chci nahrát složku s HTML prototypem (lokálně nebo přes upload), abych s ní mohl pracovat ve viewer/editor UI
- Jako dev chci u jakékoli stránky otevřít editor a vložit sekci z palety (hero, features, list, tabs, CTA, footer, modal…), abych rychle naskládal kostru stránky
- Jako dev chci mít k té samé paletě **per-projekt override** (`prototype/components/`), aby si projekt mohl přidat vlastní sekce, které generická knihovna nemá
- Jako dev chci přepínač **„generic / project theme"** — ve výchozím stavu vidím sekce v Tailwind defaults, jedním klikem se aplikuje `theme.css` + `design.md` z projektu
- Jako dev chci u stránky s `<dialog data-modal-id="X">` otevřít modál samostatně v editoru, aniž bych musel řešit overlay context
- Jako dev chci **read-only flow graf** všech stránek prototypu, kde uvidím `<a href>` propojení a modály jako satelity k parent stránce, abych se v komplexním prototypu vyznal a klikem na uzel skočil rovnou do editoru
- Jako dev chci **automatický snapshot** HTML před každým uložením, abych se mohl vrátit zpět, když experimentuju

## MVP Scope

### In scope (V1)

1. **Upload projektu** — UI pro výběr složky z disku (file input s `webkitdirectory`). Appka si projekt rozbalí do Supabase Storage a indexuje HTML soubory.
2. **Page list & viewer** — sidebar se stromem stránek, click otevře iframe preview (jako dnes v `local-file-viewer`).
3. **Editor stránky** — toggle „edit mode", paleta sekcí vlevo (generická knihovna + per-projekt overrides), klik = vložit sekci na konec / na pozici. Save přepíše HTML v Storage + uloží `SNAPSHOTS` row.
4. **Knihovna sekcí** — ~15 generických bloků v repu (`/lib/sections/*.html`): `hero-centered`, `hero-split`, `features-grid`, `features-list`, `cta-banner`, `footer-simple`, `nav-top`, `tabs`, `pricing-table`, `testimonial`, `list-cards`, `badge-row`, `modal-confirm`, `modal-form`, `empty-state`. Per-projekt overrides v `prototype/components/*.html` se naimportují při uploadu jako `CUSTOM_COMPONENTS`.
5. **Theme switch** — toggle v editoru. „Generic" = Tailwind defaults z `<head>`. „Project" = injectne `<link>` na projektový `theme.css` + agent dostane jako kontext `design.md` (uložené při uploadu na `PROJECTS`).
6. **Modal editor** — parser HTML najde `<dialog data-modal-id="X">`. Sidebar v editoru sekce „Modály na stránce" → klik otevře modál izolovaně (jen jeho HTML) v editoru. Save updatuje původní HTML.
7. **Flow view (read-only)** — graf vykreslený z `PAGE_LINKS` (parser `<a href>` při uploadu/save). Stránky = uzly, modály = satelity připojené k parent. Klik na uzel = otevře editor té stránky.
8. **Snapshots** — automatický snapshot HTML před každým save do `SNAPSHOTS`. UI ukáže history list (timestamp + note) → klik = restore.

### Out of scope (V1 → backlog)

- GitHub integration (napojení repo místo uploadu, výběr cesty k prototypu uvnitř repa)
- Editovatelný flow (drag stránek, kreslení šipek, generování `<a href>`)
- AI-powered fill („naplň hero textem X, použij obrázek Y")
- Anotace + review sessions (už řeší `local-file-viewer`)
- Upload obrázků / asset manager
- Auth + multi-user (zatím solo)
- Export jako Next.js komponenty
- Verzování s diff UI a rollback timeline
- Drag & drop pro pořadí sekcí (V1 jen append + delete)
- Inline text editing v sekcích (V1 jen vložit / smazat sekci, text edituješ v HTML view)

## Externí služby

- **Supabase** — Postgres (metadata + snapshots) + Storage (HTML soubory + assety projektu). Free tier stačí.
- **Vercel** — hosting Next.js appky.
- **Brevo / AI / file upload mimo Supabase Storage** — netřeba.

## Datový model

### Tabulka: `projects`

| Sloupec | Typ | Popis |
|---|---|---|
| `id` | int (PK, identity) | |
| `name` | text | Název projektu (z root složky) |
| `storage_bucket` | text | Cesta v Supabase Storage (`projects/{id}/`) |
| `design_md` | text | Snapshot `design.md` z projektu (pokud existuje) |
| `theme_css_path` | text | Cesta v Storage k `theme.css` (pokud existuje) |
| `theme_mode` | text | `generic` \| `project` (default `generic`) |
| `created_at` | timestamptz | |
| `user_id` | uuid | FK na auth.users (nullable pro MVP bez auth) |

### Tabulka: `pages`

| Sloupec | Typ | Popis |
|---|---|---|
| `id` | int (PK, identity) | |
| `project_id` | int → `projects(id)` ON DELETE CASCADE | |
| `file_path` | text | Relativní cesta v projektu (`01-landing/dashboard.html`) |
| `title` | text | Z `<title>` nebo file_path |
| `last_edited_at` | timestamptz | |
| `created_at` | timestamptz | |

### Tabulka: `snapshots`

| Sloupec | Typ | Popis |
|---|---|---|
| `id` | int (PK, identity) | |
| `page_id` | int → `pages(id)` ON DELETE CASCADE | |
| `html_content` | text | Plný HTML před úpravou |
| `note` | text | Volitelně (např. „před přidáním hero") |
| `created_at` | timestamptz | |

### Tabulka: `custom_components`

| Sloupec | Typ | Popis |
|---|---|---|
| `id` | int (PK, identity) | |
| `project_id` | int → `projects(id)` ON DELETE CASCADE | nullable, null = globální (V1 nepoužité) |
| `name` | text | `hero-tipmaster`, `card-league` |
| `category` | text | `hero` \| `features` \| `cta` \| `modal` \| `nav` \| `footer` \| `list` \| `other` |
| `html` | text | HTML snippet |
| `created_at` | timestamptz | |

### Tabulka: `page_links`

| Sloupec | Typ | Popis |
|---|---|---|
| `id` | int (PK, identity) | |
| `from_page_id` | int → `pages(id)` ON DELETE CASCADE | |
| `to_page_id` | int → `pages(id)` ON DELETE CASCADE | nullable (externí link → null) |
| `link_text` | text | Text odkazu (`<a>` content) |
| `is_modal_open` | boolean | true pokud `data-open-modal` nebo href na `#modal-X` |
| `modal_id` | text | `data-modal-id` cílového modálu, nullable |
| `created_at` | timestamptz | |

### Edge cases (advanced challenge)

- **Cascade delete:** smazání projektu vyhodí stránky, snapshoty, page_links i custom_components. Storage bucket se smaže explicitním cleanupem v API route (Supabase Storage cascade neřeší).
- **Když smažeš stránku, ale jiná na ni linkuje:** `page_links.to_page_id` je nullable + ON DELETE SET NULL. Flow view orphan link rozeznají (zůstává `link_text`, ale chybí target).
- **Modály bez parent stránky:** v parseru filtruj — `<dialog>` mimo HTML nezaregistrujeme jako stránku.
- **Theme override race:** při switch theme se neregeneruje HTML, jen iframe injektuje další `<link>`. Save HTML zůstává čistý.

## Diagram vztahů

(Mermaid diagram viz GitHub Issue.)

## SQL pro Supabase

```sql
-- HTML Configurator — initial schema

create table projects (
  id integer generated always as identity primary key,
  name text not null,
  storage_bucket text not null,
  design_md text,
  theme_css_path text,
  theme_mode text not null default 'generic' check (theme_mode in ('generic', 'project')),
  created_at timestamptz not null default now(),
  user_id uuid
);

create table pages (
  id integer generated always as identity primary key,
  project_id integer not null references projects(id) on delete cascade,
  file_path text not null,
  title text,
  last_edited_at timestamptz,
  created_at timestamptz not null default now(),
  unique (project_id, file_path)
);

create table snapshots (
  id integer generated always as identity primary key,
  page_id integer not null references pages(id) on delete cascade,
  html_content text not null,
  note text,
  created_at timestamptz not null default now()
);

create table custom_components (
  id integer generated always as identity primary key,
  project_id integer references projects(id) on delete cascade,
  name text not null,
  category text not null check (category in ('hero','features','cta','modal','nav','footer','list','other')),
  html text not null,
  created_at timestamptz not null default now()
);

create table page_links (
  id integer generated always as identity primary key,
  from_page_id integer not null references pages(id) on delete cascade,
  to_page_id integer references pages(id) on delete set null,
  link_text text,
  is_modal_open boolean not null default false,
  modal_id text,
  created_at timestamptz not null default now()
);

create index idx_pages_project on pages(project_id);
create index idx_snapshots_page on snapshots(page_id, created_at desc);
create index idx_page_links_from on page_links(from_page_id);
create index idx_page_links_to on page_links(to_page_id);
create index idx_custom_components_project on custom_components(project_id);

-- RLS — workshop MVP, permissive policy
alter table projects enable row level security;
alter table pages enable row level security;
alter table snapshots enable row level security;
alter table custom_components enable row level security;
alter table page_links enable row level security;

create policy "projects_allow_all" on projects for all using (true) with check (true);
create policy "pages_allow_all" on pages for all using (true) with check (true);
create policy "snapshots_allow_all" on snapshots for all using (true) with check (true);
create policy "custom_components_allow_all" on custom_components for all using (true) with check (true);
create policy "page_links_allow_all" on page_links for all using (true) with check (true);
```

**Storage:** vytvoř bucket `projects` (public read, authenticated write) v Supabase dashboardu po prvním deployi.

## Poznámky k implementaci

- **Filesystem provider abstrakce** — kód editoru nečte přímo Supabase Storage, ale rozhraní `FileProvider` (`read`, `write`, `list`). V1 má jen `SupabaseStorageProvider`. V2 (backlog) přidá `GitHubProvider`, `LocalFsProvider`.
- **HTML parser** — `node-html-parser` (rychlejší než cheerio, bez jQuery API). Použito pro: extrakci `<a href>` při uploadu, detekci `<dialog data-modal-id>`, vkládání sekcí na pozici.
- **Iframe sandbox** — preview iframe má `sandbox="allow-same-origin allow-scripts"`. Edit mode injektne `data-section-id` overlay pro klikací výběr.
- **Flow view** — `react-flow` (mature, dobře udržovaný), uzly auto-layout přes `dagre`.
