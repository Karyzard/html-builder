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
