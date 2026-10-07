import { useCallback, useId, type InputHTMLAttributes } from 'react';
import { ValidationMessage } from '../Field/ValidationMessage';
import { Icon } from '../../icons/Icon';

/**
 * Figma: `Form Fields/Checkbox` (+ `Form Fields/Checkbox / Box`).
 * - `Checked=False|True|Indeterminate` → `checked` / `defaultChecked` / `indeterminate`.
 * - `State=Hover|Focus` → CSS; `State=Disabled` → `isDisabled`. Error = message row below (Field pattern).
 * - Box: 32 px, 1 px `border/control` (4.8:1), `radius/small` — same as `Form Fields/Checkbox / Box`.
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'disabled'> {
  /** Required. Clickable and tied to the box (C-R3). */
  label: string;
  /** Help under the label. */
  description?: string;
  /** Mixed state for a "select all" parent. Shown with a dash, announced as "mixed". */
  indeterminate?: boolean;
  isDisabled?: boolean;
  /** Error message under the label (C-R6). Sets aria-invalid. */
  error?: string;
}

export function Checkbox({ label, description, indeterminate = false, isDisabled = false, error, id, className, ...rest }: CheckboxProps) {
  const auto = useId();
  const inputId = id ?? `${auto}-cb`;
  const descId = description ? `${auto}-desc` : undefined;
  const errId = error ? `${auto}-err` : undefined;
  // Callback ref: the DOM property is set in the same commit, before anything can read it.
  const ref = useCallback((el: HTMLInputElement | null) => {
    if (el) el.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <div className={['flex flex-col gap-1', className].filter(Boolean).join(' ')}>
      <div className="flex items-start gap-3">
        <span className="relative inline-flex size-8 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={isDisabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
            className="peer absolute inset-0 m-0 size-8 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            {...rest}
          />
          <span
            aria-hidden="true"
            className={[
              'pointer-events-none flex size-8 items-center justify-center rounded-small border bg-surface text-inverse',
              error ? 'border-error' : 'border-control',
              'peer-hover:border-[color:var(--color-text-secondary)]',
              'peer-checked:bg-action peer-checked:border-accent peer-hover:peer-checked:bg-action-hover',
              'peer-indeterminate:bg-action peer-indeterminate:border-accent',
              'peer-focus-visible:shadow-focus',
              'peer-disabled:bg-disabled peer-disabled:border-disabled peer-disabled:text-disabled',
              '[&>svg]:hidden peer-checked:[&>.check]:block peer-indeterminate:[&>.dash]:block',
            ].join(' ')}
          >
            <Icon name="check" size={20} strokeWidth={2.5} className="check" />
            <svg className="dash" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        </span>
        <span className="flex flex-col gap-0.5 pt-1.5">
          <label htmlFor={inputId} className={`type-desktop-body-caption-strong ${isDisabled ? 'text-disabled' : 'text-primary cursor-pointer'}`}>
            {label}
          </label>
          {description && <span id={descId} className="type-desktop-body-caption-default text-tertiary">{description}</span>}
        </span>
      </div>
      <ValidationMessage id={errId} className="pl-11">{error}</ValidationMessage>
    </div>
  );
}
