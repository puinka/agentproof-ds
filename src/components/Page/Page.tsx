import { useId, type ReactNode, type Ref } from 'react';
import { BannerRegion } from '../Banner/Banner';

/**
 * Page: the frame of one product page. Title, optional eyebrow, description and actions, a slot for
 * page-level notices, then the content, at one of two content widths.
 * Added after build-run D: 16 agent-built screens used four different hand-picked widths
 * (640/720/800/880 px) and two weights for the same page title.
 *
 * - `width="narrow"` (size/content-narrow, 640): one task — an upload, a short form, settings.
 *   `width="default"` (size/content-default, 880): lists, tables, overviews.
 * - The title is the page's only h1 (`Desktop/Header/Small/Default`). Sections inside use h2.
 * - `titleRef` lets you move focus to the title after the element that had focus disappears
 *   (e.g. the row you just removed). The title is focusable from script only (tabIndex −1).
 * - `notices` sits between the header and the content: Banners about the whole page. It is a live region
 *   that is always on the page, so a Banner added after an action ("Saved") is announced without `live`.
 *   A problem with one field or one file belongs on that field, not here.
 * - Page renders no landmark; the app shell owns <main>.
 */
export interface PageProps {
  title: string;
  /** Mono label above the title: the section of the product ("Account", "Quota 2026"). */
  eyebrow?: string;
  /** One or two sentences under the title: what this page is for. */
  description?: ReactNode;
  /** Page-level actions, right of the title on wide screens, under it on phones. One primary at most. */
  actions?: ReactNode;
  /** Banners about the whole page. */
  notices?: ReactNode;
  width?: 'default' | 'narrow';
  titleRef?: Ref<HTMLHeadingElement>;
  children: ReactNode;
  className?: string;
}

const widths = { default: 'max-w-content-default', narrow: 'max-w-content-narrow' } as const;

export function Page({ title, eyebrow, description, actions, notices, width = 'default', titleRef, children, className }: PageProps) {
  const titleId = useId();
  return (
    <div className={['mx-auto flex w-full flex-col gap-8', widths[width], className].filter(Boolean).join(' ')} data-page-width={width}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          {eyebrow && <p className="m-0 type-desktop-body-eyebrow text-tertiary">{eyebrow}</p>}
          <h1 id={titleId} ref={titleRef} tabIndex={-1} className="m-0 type-desktop-header-small-default text-primary outline-none">
            {title}
          </h1>
          {description && <div className="type-desktop-body-caption-default text-secondary [&_p]:m-0">{description}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
      </header>
      {/* Always rendered: a Banner added here after an action is announced. */}
      <BannerRegion>{notices}</BannerRegion>
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  );
}
