import type { InputHTMLAttributes, ReactNode } from 'react';
import { useField } from '../Field/Field';

/**
 * Figma: `text input` (`State=Default|Hover|Focus|Error|Success|Disabled`, `Value`), placed inside `Field`.
 * Status comes from the Field. Height = `size/control-lg` (48), same as Button L.
 */
export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'disabled'> {
  /** Optional leading icon, e.g. a search glass. */
  icon?: ReactNode;
  /** Use only outside a Field; inside a Field the Field's flag wins. */
  isDisabled?: boolean;
}

const border = {
  none: 'border-control hover:border-[color:var(--color-text-secondary)]',
  warning: 'border-control hover:border-[color:var(--color-text-secondary)]', // border/warning is 1.9:1, too weak for a control boundary
  error: 'border-error',
  success: 'border-success',
} as const;

export function TextInput({ icon, isDisabled, className, id, ...rest }: TextInputProps) {
  const field = useField();
  const disabled = field?.isDisabled ?? isDisabled ?? false;
  const status = field?.status ?? 'none';
  if (!field && !rest['aria-label'] && !rest['aria-labelledby'] && import.meta.env?.DEV) {
    console.warn('[TextInput] Outside a Field, pass aria-label or aria-labelledby.');
  }
  const box = [
    'flex items-center gap-2 w-full min-h-control-lg rounded-control border-2 px-3',
    disabled
      ? 'bg-disabled border-disabled text-disabled cursor-not-allowed'
      : `bg-surface text-primary ${border[status]} focus-within:border-accent focus-within:shadow-focus`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={box}>
      {icon && <span className={`inline-flex shrink-0 [&>svg]:size-5 ${disabled ? 'text-disabled' : 'icon-secondary'}`}>{icon}</span>}
      <input
        id={field?.inputId ?? id}
        disabled={disabled}
        aria-invalid={status === 'error' || undefined}
        aria-required={field?.isRequired || undefined}
        aria-describedby={field?.describedBy}
        className="w-full min-w-0 bg-transparent py-2 outline-none type-desktop-body-paragraph-default placeholder:text-tertiary disabled:cursor-not-allowed"
        {...rest}
      />
    </div>
  );
}
