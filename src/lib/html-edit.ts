/**
 * Vloží HTML snippet před uzavírací </body>. Pokud body chybí, appendne na konec.
 */
export function insertSection(originalHtml: string, sectionHtml: string): string {
  const wrapped = `\n${sectionHtml}\n`;
  const bodyClose = /<\/body>/i;

  if (bodyClose.test(originalHtml)) {
    return originalHtml.replace(bodyClose, `${wrapped}</body>`);
  }
  return originalHtml + wrapped;
}
