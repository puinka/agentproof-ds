import { useId, useState, type ReactNode } from 'react';
import { Icon } from '../../icons/Icon';

/**
 * RadioList: one choice from 2–6 options, all visible (closes design.md G14: single choice and the selected option tile).
 * Native radios in a fieldset: arrow keys move the choice, Tab leaves the group, the legend names it.
 *
 * - `layout="list"`: short labels, a form column. `layout="tiles"`: options that need a description
 *   or a value (a price, a date) and should be compared side by side.
 * - Selected tile: `border/accent` 2 px on `background/surface`, plus the radio dot, so the state never
 *   depends on colour alone. No tinted fill: a grey fill reads as disabled.
 * - More than 6 options → a select. Yes/no → a single Checkbox or Switch.
 */
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  /** Right-aligned value in tiles: a price, a date. Keep it short. */
  meta?: ReactNode;
  disabled?: boolean;
}

export interface RadioListProps {
  /** Required. The question: "How do you want to be paid?". */
  legend: string;
  /** Visually hide the legend when a heading right above says the same. It stays the group's name. */
  hideLegend?: boolean;
  options: RadioOption[];
  /** Form field name. Defaults to a generated id. */
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  layout?: 'list' | 'tiles';
  /** Help under the legend. */
  description?: string;
  /** Error message (e.g. nothing chosen). Sets aria-invalid on the group. */
  error?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function RadioList({
  legend, hideLegend = false, options, name, value, defaultValue, onChange, layout = 'list', description, error,
  isRequired = false, isDisabled = false, className,
}: RadioListProps) {
  const auto = useId();
  const groupName = name ?? auto;
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const descId = description ? `${auto}-desc` : undefined;
  const errId = error ? `${auto}-err` : undefined;
  const tiles = layout === 'tiles';

  return (
    <fieldset
      role="radiogroup"
      aria-required={isRequired || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
      disabled={isDisabled}
      className={['m-0 flex min-w-0 flex-col gap-3 border-0 p-0', className].filter(Boolean).join(' ')}
    >
      <legend className={hideLegend ? 'sr-only' : 'mb-2 p-0 type-desktop-body-caption-strong text-primary'}>{legend}</legend>
      {description && <p id={descId} className="-mt-1 mb-1 type-desktop-body-caption-default text-tertiary">{description}</p>}
      <div className={tiles ? 'grid gap-3 sm:grid-cols-2' : 'flex flex-col gap-3'}>
        {options.map((o) => {
          const id = `${auto}-${o.value}`;
          const oDesc = o.description ? `${id}-desc` : undefined;
          const disabled = isDisabled || o.disabled;
          return (
            <label
              key={o.value}
              htmlFor={id}
              className={[
                'flex items-start gap-3',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                tiles &&
                  [
                    'rounded-container border bg-surface p-4',
                    disabled ? 'border-disabled' : error ? 'border-error' : 'border-control',
                    !disabled && 'has-[:checked]:border-accent has-[:checked]:shadow-[inset_0_0_0_1px_var(--color-border-accent)]',
                    !disabled && 'hover:border-[color:var(--color-text-secondary)] has-[:checked]:hover:border-accent',
                    'has-[:focus-visible]:shadow-focus',
                  ].filter(Boolean).join(' '),
              ].filter(Boolean).join(' ')}
            >
              <span className="relative inline-flex size-6 shrink-0 items-center justify-center">
                <input
                  id={id}
                  type="radio"
                  name={groupName}
                  value={o.value}
                  checked={current === o.value}
                  onChange={() => { setInner(o.value); onChange?.(o.value); }}
                  disabled={disabled}
                  required={isRequired}
                  aria-labelledby={[`${id}-label`, o.meta ? `${id}-meta` : ''].filter(Boolean).join(' ')}
                  aria-describedby={oDesc}
                  className="peer absolute inset-0 m-0 size-6 cursor-[inherit] opacity-0"
                />
                <span
                  aria-hidden="true"
                  className={[
                    'pointer-events-none flex size-6 items-center justify-center rounded-full border bg-surface',
                    error ? 'border-error' : 'border-control',
                    'peer-hover:border-[color:var(--color-text-secondary)] peer-checked:border-accent peer-checked:border-2',
                    tiles ? '' : 'peer-focus-visible:shadow-focus',
                    'peer-disabled:bg-disabled peer-disabled:border-disabled peer-disabled:[&>span]:bg-[color:var(--color-icon-disabled)]',
                    '[&>span]:hidden peer-checked:[&>span]:block',
                  ].join(' ')}
                >
                  <span className="size-2.5 rounded-full bg-action" />
                </span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
                <span className="flex items-baseline justify-between gap-3">
                  <span id={`${id}-label`} className={`type-desktop-body-caption-strong ${disabled ? 'text-disabled' : 'text-primary'}`}>{o.label}</span>
                  {o.meta && <span id={`${id}-meta`} className={`shrink-0 type-desktop-body-caption-strong tabular-nums ${disabled ? 'text-disabled' : 'text-primary'}`}>{o.meta}</span>}
                </span>
                {o.description && (
                  <span id={oDesc} className={`type-desktop-body-caption-default ${disabled ? 'text-disabled' : 'text-tertiary'}`}>{o.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errId} className="m-0 flex items-start gap-1.5 type-desktop-body-caption-default text-error">
          <Icon name="exclamation-circle" size={20} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </fieldset>
  );
}
