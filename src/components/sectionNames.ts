import { useEffect, type RefObject } from 'react';

/**
 * Sections and names (Foundations / Sections and names). Screen-reader users move through a page by its
 * named sections, like a table of contents. Two sections with one name read as the same entry twice.
 *
 * In development, warns when the element's accessible name repeats the name of another landmark on the
 * page (a section with a heading, a region, a nav). The story checks catch the same thing with axe
 * (`landmark-unique`); this warning reaches product code that has no story.
 */
const LANDMARKS = 'section[aria-label], section[aria-labelledby], [role="region"], nav, aside, [role="navigation"], [role="complementary"]';

function nameOf(el: Element): string {
  const by = el.getAttribute('aria-labelledby');
  if (by) {
    return by
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return (el.getAttribute('aria-label') ?? '').trim();
}

export function useUniqueSectionName(ref: RefObject<HTMLElement | null>, component: string) {
  useEffect(() => {
    if (!import.meta.env?.DEV) return;
    const el = ref.current;
    if (!el) return;
    const own = nameOf(el).toLowerCase();
    if (!own) return;
    const clash = Array.from(el.ownerDocument.querySelectorAll(LANDMARKS)).find(
      (other) => other !== el && nameOf(other).toLowerCase() === own,
    );
    if (clash) {
      console.warn(
        `[${component}] Another section on this page is also named "${nameOf(el)}". Screen readers will list it twice. ` +
          'Leave the name to the heading that already says it, or give this one a name that says what it adds.',
      );
    }
  });
}
