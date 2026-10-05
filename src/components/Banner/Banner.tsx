import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../icons/Icon';

/**
 * Banner: a status message inside the page, above the content it is about (closes design.md G9, part 2).
 * Four statuses, each with its own icon and a word in the title: colour alone never carries the status.
 *
 * - Static by default. A banner that is on the page when it loads is read in order and must not interrupt.
 * - `live="polite"` for a message that appears after an action (saved, sent).
 *   `live="assertive"` only for an error that blocks the task the user is doing right now.
 * - At most one action, as a link-style button or a link. Dismiss only when the message is not needed again.
 * - Not the lime "Highlight banner" from marketing pages: that one promotes, this one informs.
 */
export type BannerStatus = 'info' | 'success' | 'warning' | 'error';

export interface BannerProps {
  status?: BannerStatus;
  /** Short, starts with the point: "Payment sent", "We couldn't verify your document". */
  title: string;
  /** One or two sentences: what it means and what to do. */
  children?: ReactNode;
  /** One action: a Button `variant="link"` or a link. */
  action?: ReactNode;
  /** Shows a close button. The page decides whether the banner comes back. */
  onDismiss?: () => void;
  /** Accessible name of the close button. Defaults to "Dismiss". */
  dismissLabel?: string;
  /** Announce when it appears: see the rules above. Off for banners present on load. */
  live?: false | 'polite' | 'assertive';
  className?: string;
}

const ui: Record<BannerStatus, { box: string; icon: IconName; text: string }> = {
  info: { box: 'bg-info border-info', icon: 'information-circle', text: 'text-info' },
  success: { box: 'bg-success border-success', icon: 'check-circle', text: 'text-success' },
  warning: { box: 'bg-warning border-warning', icon: 'exclamation-triangle', text: 'text-warning' },
  error: { box: 'bg-error border-error', icon: 'exclamation-circle', text: 'text-error' },
};

export function Banner({ status = 'info', title, children, action, onDismiss, dismissLabel = 'Dismiss', live = false, className }: BannerProps) {
  const u = ui[status];
  const role = live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined;
  return (
    <div role={role} className={['flex items-start gap-3 rounded-container border p-4', u.box, className].filter(Boolean).join(' ')}>
      <Icon name={u.icon} size={24} className={`shrink-0 ${u.text}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
        <p className={`m-0 type-desktop-body-caption-strong ${u.text}`}>{title}</p>
        {children && <div className="type-desktop-body-caption-default text-primary [&_p]:m-0">{children}</div>}
        {action && <div className="mt-1 flex">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="-mr-1 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-control text-secondary outline-none hover:bg-hover-overlay hover:text-primary focus-visible:shadow-focus"
        >
          <Icon name="x-mark" size={20} />
        </button>
      )}
    </div>
  );
}
