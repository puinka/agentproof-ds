import { useId, useState, type ButtonHTMLAttributes } from 'react';

/**
 * Figma: `Switch` (renamed from `Form Fields/Radio`).
 * - `Pressed=False|True` → `checked` / `defaultChecked`; `State=Hover|Focus` → CSS; `State=Disabled` → `isDisabled`.
 * - Off track `background/track` (4.8:1), same as Figma since v1.10.
 * Use for settings that take effect immediately. For a choice inside a form that is submitted, use a Checkbox.
 */
export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'disabled'> {
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  isDisabled?: boolean;
  /** Label before or after the switch. */
  labelPosition?: 'start' | 'end';
}

export function Switch({ label, description, checked, defaultChecked = false, onCheckedChange, isDisabled = false, labelPosition = 'end', className, ...rest }: SwitchProps) {
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  const id = useId();
  const toggle = () => {
    if (isDisabled) return;
    const next = !on;
    if (checked === undefined) setInner(next);
    onCheckedChange?.(next);
  };
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-labelledby={`${id}-label`}
      aria-describedby={description ? `${id}-desc` : undefined}
      disabled={isDisabled}
      onClick={toggle}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill outline-none focus-visible:shadow-focus',
        isDisabled ? 'bg-disabled-strong cursor-not-allowed' : on ? 'bg-action hover:bg-action-hover cursor-pointer' : 'bg-track cursor-pointer',
      ].join(' ')}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 size-5 rounded-pill bg-surface shadow-sm motion-safe:transition-[left] ${on ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
  const text = (
    <span className="flex flex-col gap-0.5">
      <span id={`${id}-label`} className={`type-desktop-body-caption-strong ${isDisabled ? 'text-disabled' : 'text-primary'}`} onClick={toggle}>
        {label}
      </span>
      {description && <span id={`${id}-desc`} className="type-desktop-body-caption-default text-tertiary">{description}</span>}
    </span>
  );
  return (
    <div className={['inline-flex items-start gap-3', className].filter(Boolean).join(' ')}>
      {labelPosition === 'start' ? <>{text}{control}</> : <>{control}{text}</>}
    </div>
  );
}
