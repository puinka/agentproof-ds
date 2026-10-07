import { useRef, type FormEvent, type FormHTMLAttributes } from 'react';

/**
 * Form: a `<form>` that handles the step every form forgets: after a submit that left errors,
 * focus moves to the first invalid control, so the user (and a screen reader) lands on the problem.
 * Added after build-run D, where 5 of 6 agent screens showed an empty-submit error nobody would hear.
 *
 * - Validate in `onSubmit` as usual and set `error` / `status="error"` on the controls. Form looks for
 *   the first `[aria-invalid="true"]` after React has rendered and focuses it: a text input itself,
 *   or, for a RadioList / checkbox group, its checked option or first enabled option.
 * - Browser validation bubbles are off (`noValidate`): the DS messages say what to do, in our words.
 * - Focus doesn't move if the user is already in an invalid control.
 * - Errors are still shown on each control. With more than ~3 fields, add an error summary at the top
 *   (a Banner `status="error"`) that lists them; one field needs no summary.
 */
export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'noValidate'> {
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

const focusable = (el: Element): HTMLElement | null => {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return el;
  return (
    el.querySelector<HTMLElement>('input:checked:not(:disabled)') ??
    el.querySelector<HTMLElement>('input:not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not([aria-disabled="true"])')
  );
};

export function focusFirstInvalid(form: HTMLFormElement) {
  const first = form.querySelector('[aria-invalid="true"]');
  if (!first) return false;
  const active = document.activeElement;
  if (active && active.closest('[aria-invalid="true"]')) return true;
  focusable(first)?.focus();
  return true;
}

export function Form({ onSubmit, children, ...rest }: FormProps) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      noValidate
      onSubmit={(e) => {
        onSubmit?.(e);
        // Wait for the error state to render, then focus the first invalid control.
        requestAnimationFrame(() => requestAnimationFrame(() => ref.current && focusFirstInvalid(ref.current)));
      }}
      {...rest}
    >
      {children}
    </form>
  );
}
