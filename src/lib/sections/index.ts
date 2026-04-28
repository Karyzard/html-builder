export type SectionDef = {
  slug: string;
  name: string;
  category: "hero" | "features" | "cta" | "nav" | "footer" | "list" | "other";
  html: string;
};

export const SECTIONS: SectionDef[] = [
  {
    slug: "nav-top",
    name: "Top navigace",
    category: "nav",
    html: `<nav class="border-b border-slate-200 bg-white">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <a href="#" class="text-lg font-semibold">Logo</a>
    <ul class="flex gap-6 text-sm text-slate-600">
      <li><a href="#" class="hover:text-slate-900">Funkce</a></li>
      <li><a href="#" class="hover:text-slate-900">Cena</a></li>
      <li><a href="#" class="hover:text-slate-900">Kontakt</a></li>
    </ul>
  </div>
</nav>`,
  },
  {
    slug: "hero-centered",
    name: "Hero (centrovaný)",
    category: "hero",
    html: `<section class="bg-white py-24 text-center">
  <div class="mx-auto max-w-3xl px-4">
    <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Velký nadpis aplikace</h1>
    <p class="mx-auto mt-4 max-w-xl text-lg text-slate-600">Krátký popis, co tady děláš a proč by to mělo někoho zajímat.</p>
    <div class="mt-8 flex justify-center gap-3">
      <a href="#" class="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700">Začít</a>
      <a href="#" class="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Více info</a>
    </div>
  </div>
</section>`,
  },
  {
    slug: "features-grid",
    name: "Features (3 sloupce)",
    category: "features",
    html: `<section class="bg-slate-50 py-20">
  <div class="mx-auto max-w-6xl px-4">
    <h2 class="text-center text-3xl font-semibold">Hlavní funkce</h2>
    <div class="mt-12 grid gap-8 sm:grid-cols-3">
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <div class="mb-3 h-10 w-10 rounded bg-slate-200"></div>
        <h3 class="font-semibold">Rychlost</h3>
        <p class="mt-1 text-sm text-slate-600">Krátký popis benefitu.</p>
      </div>
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <div class="mb-3 h-10 w-10 rounded bg-slate-200"></div>
        <h3 class="font-semibold">Spolehlivost</h3>
        <p class="mt-1 text-sm text-slate-600">Krátký popis benefitu.</p>
      </div>
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <div class="mb-3 h-10 w-10 rounded bg-slate-200"></div>
        <h3 class="font-semibold">Jednoduchost</h3>
        <p class="mt-1 text-sm text-slate-600">Krátký popis benefitu.</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    slug: "list-cards",
    name: "Seznam karet",
    category: "list",
    html: `<section class="bg-white py-16">
  <div class="mx-auto max-w-6xl px-4">
    <h2 class="text-2xl font-semibold">Položky</h2>
    <ul class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li class="rounded-lg border border-slate-200 p-5">
        <h3 class="font-semibold">Karta 1</h3>
        <p class="mt-1 text-sm text-slate-600">Popis první karty.</p>
      </li>
      <li class="rounded-lg border border-slate-200 p-5">
        <h3 class="font-semibold">Karta 2</h3>
        <p class="mt-1 text-sm text-slate-600">Popis druhé karty.</p>
      </li>
      <li class="rounded-lg border border-slate-200 p-5">
        <h3 class="font-semibold">Karta 3</h3>
        <p class="mt-1 text-sm text-slate-600">Popis třetí karty.</p>
      </li>
    </ul>
  </div>
</section>`,
  },
  {
    slug: "testimonial",
    name: "Reference / citát",
    category: "other",
    html: `<section class="bg-slate-900 py-20 text-white">
  <div class="mx-auto max-w-3xl px-4 text-center">
    <p class="text-2xl font-medium leading-relaxed">„Tahle appka mi změnila workflow. Bez ní si to už neumím představit."</p>
    <div class="mt-6 text-sm text-slate-300">
      <div class="font-semibold text-white">Jane Doe</div>
      <div>CEO, Example Co.</div>
    </div>
  </div>
</section>`,
  },
  {
    slug: "cta-banner",
    name: "CTA banner",
    category: "cta",
    html: `<section class="bg-indigo-600 py-16 text-center text-white">
  <div class="mx-auto max-w-3xl px-4">
    <h2 class="text-3xl font-semibold">Připraveni začít?</h2>
    <p class="mt-3 text-indigo-100">Pár vět co přesvědčí váhajícího uživatele.</p>
    <a href="#" class="mt-6 inline-block rounded-md bg-white px-6 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50">Vyzkoušet zdarma</a>
  </div>
</section>`,
  },
  {
    slug: "footer-simple",
    name: "Footer (jednoduchý)",
    category: "footer",
    html: `<footer class="border-t border-slate-200 bg-white py-8">
  <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row">
    <div>© 2026 Moje Appka</div>
    <ul class="flex gap-6">
      <li><a href="#" class="hover:text-slate-900">Podmínky</a></li>
      <li><a href="#" class="hover:text-slate-900">Soukromí</a></li>
      <li><a href="#" class="hover:text-slate-900">Kontakt</a></li>
    </ul>
  </div>
</footer>`,
  },
  {
    slug: "empty-state",
    name: "Prázdný stav",
    category: "other",
    html: `<section class="flex flex-col items-center justify-center bg-white px-4 py-20 text-center">
  <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
    <svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
  </div>
  <h2 class="text-xl font-semibold">Zatím nic tu není</h2>
  <p class="mt-1 max-w-sm text-sm text-slate-600">Začni přidáním první položky.</p>
  <a href="#" class="mt-6 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700">Přidat první položku</a>
</section>`,
  },
];

export function getSectionBySlug(slug: string): SectionDef | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}
