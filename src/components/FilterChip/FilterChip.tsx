import type { ButtonHTMLAttributes } from 'react';

/**
 * Figma: `Filter chip` (renamed from `Badge`): `State=Default|Hover|Focus|Selected`.
 * A toggle button: `aria-pressed` carries the state for assistive tech. Selected changes fill,
 * border and colour, and keeps Semi-bold so the width does not jump.
 */
export interface FilterChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  selected?: boolean;
}

export function FilterChip({ label, selected = false, className, ...rest }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={[
        'inline-flex min-h-target-min items-center rounded-pill border px-2 py-1 type-desktop-body-caption-strong outline-none focus-visible:shadow-focus',
        selected ? 'bg-accent-muted border-accent text-accent-hover' : 'bg-muted border-default text-secondary hover:bg-neutral hover:border-control',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {label}
    </button>
  );
}
