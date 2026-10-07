import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../icons/Icon';

/**
 * The message under a control (error, warning, success), shared by Field, RadioList and Checkbox.
 *
 * The live region is always in the page and only its content changes, so a message that appears
 * after an action (an empty submit, a failed check) is announced. A message already there on load
 * is read in order, not announced. Found in build-run D: 5 of 6 agent screens passed `error` to
 * RadioList correctly, and the error was still silent, because the component rendered it statically.
 */
export type MessageStatus = 'error' | 'warning' | 'success';

const ui: Record<MessageStatus, { icon: IconName; text: string }> = {
  error: { icon: 'exclamation-circle', text: 'text-error' },
  warning: { icon: 'exclamation-triangle', text: 'text-warning' },
  success: { icon: 'check-circle', text: 'text-success' },
};

export function ValidationMessage({
  id, status = 'error', children, className,
}: { id?: string; status?: MessageStatus; children?: ReactNode; className?: string }) {
  const u = ui[status];
  return (
    <div aria-live="polite" aria-atomic="true" className="empty:hidden">
      {children ? (
        <p id={id} className={['m-0 flex items-start gap-1.5 type-desktop-body-caption-default', u.text, className].filter(Boolean).join(' ')}>
          <Icon name={u.icon} size={20} className="shrink-0" />
          <span>{children}</span>
        </p>
      ) : null}
    </div>
  );
}
