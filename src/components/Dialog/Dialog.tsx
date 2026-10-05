import { useEffect, useId, useRef, type FormEvent, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react';
import { Button } from '../Button/Button';
import { Icon } from '../../icons/Icon';

/**
 * Modal dialog: asks for a decision or a short input without leaving the page (closes design.md G9, part 1).
 * Built on the native `<dialog>` + `showModal()`: the page behind is inert, Esc closes, focus is trapped.
 *
 * - One question per dialog. The title asks it ("Withdraw this application?"), the buttons answer it.
 * - Focus starts on the safe action for `tone="destructive"`, otherwise on the first field or the primary action.
 * - Focus returns to the element that opened the dialog.
 * - Backdrop click closes non-destructive dialogs only; a destructive one needs an explicit answer.
 * - Not for status messages (use Banner) or for long flows (use a page).
 */
export interface DialogAction {
  label: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export interface DialogProps {
  open: boolean;
  /** Called on Esc, the close button, the secondary action and (non-destructive) backdrop click. */
  onClose: () => void;
  /** A question or a short task name. Becomes the dialog's accessible name. */
  title: string;
  /** One or two sentences: what happens and what can't be undone. Becomes the accessible description. */
  description?: ReactNode;
  /** Extra content: fields, a summary list. Keep it short; long content belongs on a page. */
  children?: ReactNode;
  /** Destructive styles the primary action as destructive and moves first focus to the safe action. */
  tone?: 'default' | 'destructive';
  /** The answer that does something. Name the action with a verb ("Withdraw application"). */
  primaryAction: DialogAction;
  /** The safe answer. Closes the dialog. Defaults to "Cancel". */
  secondaryLabel?: string;
  /** Makes the content a form: Enter submits, the primary action becomes the submit button. */
  onSubmit?: (data: FormData) => void;
  /** `sm` = 440 px (confirmations), `md` = 560 px (short forms). */
  size?: 'sm' | 'md';
  /** Hides the close icon. Esc and the secondary action still close. */
  hideCloseButton?: boolean;
}

const width = { sm: 'max-w-[440px]', md: 'max-w-[560px]' } as const;

export function Dialog({
  open, onClose, title, description, children, tone = 'default', primaryAction, secondaryLabel = 'Cancel',
  onSubmit, size = 'sm', hideCloseButton = false,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
      const first =
        tone === 'destructive'
          ? d.querySelector<HTMLElement>('[data-dialog-safe]')
          : d.querySelector<HTMLElement>('[data-dialog-body] input, [data-dialog-body] select, [data-dialog-body] textarea') ??
            d.querySelector<HTMLElement>('[data-dialog-primary]');
      first?.focus();
    } else if (!open && d.open) {
      d.close();
      opener.current?.focus();
    }
  }, [open, tone]);

  // Esc fires `cancel`: keep React in charge of `open`.
  const onCancel = (e: SyntheticEvent) => { e.preventDefault(); onClose(); };
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (tone !== 'destructive' && e.target === e.currentTarget) onClose();
  };
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit?.(new FormData(e.currentTarget)); };

  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className="m-0 type-desktop-header-card-strong text-primary">{title}</h2>
        {!hideCloseButton && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-2 -mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-control text-secondary outline-none hover:bg-hover-overlay hover:text-primary focus-visible:shadow-focus"
          >
            <Icon name="x-mark" size={20} />
          </button>
        )}
      </div>
      {description && <div id={descId} className="type-desktop-body-caption-default text-secondary [&_p]:m-0">{description}</div>}
      {children && <div data-dialog-body className="flex flex-col gap-4">{children}</div>}
      <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" label={secondaryLabel} onClick={onClose} data-dialog-safe className="w-full sm:w-auto" />
        <Button
          label={primaryAction.label}
          tone={tone}
          isLoading={primaryAction.isLoading}
          type={onSubmit ? 'submit' : 'button'}
          onClick={onSubmit ? undefined : primaryAction.onClick}
          data-dialog-primary
          className="w-full sm:w-auto"
        />
      </div>
    </>
  );

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={onCancel}
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(e); }}
      onClick={onBackdrop}
      className={`m-auto w-[calc(100%-32px)] ${width[size]} rounded-container border border-subtle bg-surface p-0 text-primary shadow-xl backdrop:bg-overlay`}
    >
      {onSubmit ? (
        <form onSubmit={submit} className="flex flex-col gap-4 p-6">{body}</form>
      ) : (
        <div className="flex flex-col gap-4 p-6">{body}</div>
      )}
    </dialog>
  );
}
