import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';

/**
 * Figma: `Button` component set. Mapping from Figma properties to these props:
 * - `Type=Primary|Ghost|Link`   → `variant="primary|ghost|link"`
 * - `Tone=Default|Destructive`  → `tone`
 * - `Size=L|S`                  → `size="lg|sm"`
 * - `State=White`               → `onDark` (an appearance, not a state: design.md G2)
 * - `State=Hover|Focus`         → CSS `:hover` / `:focus-visible`, not props
 * - `State=Disabled`            → `isDisabled` (uses `aria-disabled`, see B-R6)
 * - `Leading icon` + `Icon`     → `icon`
 * - `Border radius`             → removed: it is fully decided by `variant` (spec B2)
 * - `isLoading`                 → code only for now; Figma has no Loading state yet
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'> {
  /** Required. The visible text and the accessible name. Name the action with a verb: "Delete account", not "OK" (B-R2). */
  label: string;
  /** Primary = the one main action in a view (B-R1). Ghost = secondary, outlined. Link = tertiary, text only. */
  variant?: 'primary' | 'ghost' | 'link';
  /** Destructive for irreversible actions (B-R4). Exists for primary and ghost only. */
  tone?: 'default' | 'destructive';
  /** `sm` only inside dense rows: tables, lists, cards (B-R5). Ignored for `link`. */
  size?: 'lg' | 'sm';
  /** Use on dark or brand backgrounds (B-R8). Ghost and link only; Figma has no Primary on dark yet (G22). */
  onDark?: boolean;
  /** Leading icon. Takes the label's colour automatically. */
  icon?: ReactNode;
  /** Keeps the button focusable and announced as unavailable, but ignores clicks (B-R6). The form must say what is missing. */
  isDisabled?: boolean;
  /** Shows a spinner, sets `aria-busy`, ignores clicks. */
  isLoading?: boolean;
  /** Renders a link that looks like this button. Only for a call to action that goes to another page
   * (e.g. "Register now" in the site header); actions on the page stay buttons. */
  href?: string;
}

const base =
  'inline-flex items-center justify-center gap-2 type-button whitespace-nowrap select-none outline-none ' +
  'focus-visible:shadow-focus aria-disabled:cursor-not-allowed';

// Heights come from role sizes (Figma `Semantic / Size`): lg = size/control-lg (48, same as inputs), sm = size/control-sm (40).
// Ghost has a 2px border, so its padding is 2px smaller: Figma strokes sit inside the frame, CSS borders add to it.
const sizes = {
  solid: { lg: 'min-h-control-lg py-3 px-6', sm: 'min-h-control-sm py-2 px-4' },
  outlined: { lg: 'min-h-control-lg py-2.5 px-5.5', sm: 'min-h-control-sm py-1.5 px-3.5' },
} as const;

function classes(variant: NonNullable<ButtonProps['variant']>, tone: NonNullable<ButtonProps['tone']>, onDark: boolean, disabled: boolean) {
  if (variant === 'link') {
    const color = disabled ? 'text-disabled' : onDark ? 'text-inverse hover:underline' : 'text-accent hover:text-accent-hover hover:underline';
    return `rounded-lg p-0 ${color}`;
  }
  if (variant === 'ghost') {
    if (disabled) return 'rounded-control border-2 border-disabled text-disabled';
    if (onDark)
      return 'rounded-control border-2 border-[color:var(--color-text-inverse)] text-inverse hover:bg-inverse-hover-overlay';
    if (tone === 'destructive')
      return 'rounded-control border-2 border-danger text-danger hover:bg-danger hover:border-danger-hover';
    // Focus keeps the outline and the transparent fill: the Figma Focus variant
    // (text/accent on background/accent-muted, 3.8:1) fails 1.4.3, spec B6.
    return 'rounded-control border-2 border-accent text-accent hover:bg-accent-subtle hover:border-accent-hover hover:text-accent-hover';
  }
  // primary
  if (disabled) return 'rounded-control bg-disabled-strong text-disabled';
  if (tone === 'destructive') return 'rounded-control bg-danger-solid text-inverse hover:bg-danger-solid-hover';
  return 'rounded-control bg-action text-inverse hover:bg-action-hover hover:shadow-base';
}

function Spinner() {
  return (
    <svg className="motion-safe:animate-spin" width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Button({
  label,
  variant = 'primary',
  tone = 'default',
  size = 'lg',
  onDark = false,
  icon,
  isDisabled = false,
  isLoading = false,
  type = 'button',
  onClick,
  className,
  href,
  ...rest
}: ButtonProps) {
  if (tone === 'destructive' && variant === 'link' && import.meta.env?.DEV) {
    console.warn('[Button] tone="destructive" is not defined for variant="link". Use variant="ghost".');
  }
  const blocked = isDisabled || isLoading;
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (blocked) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  const cls = [base, variant === 'link' ? '' : sizes[variant === 'ghost' ? 'outlined' : 'solid'][size], classes(variant, tone, onDark, isDisabled), className]
    .filter(Boolean)
    .join(' ');
  if (href) {
    return (
      <a href={href} className={`${cls} no-underline`}>
        {icon ? <span className="inline-flex shrink-0 [&>svg]:size-5">{icon}</span> : null}
        <span>{label}</span>
      </a>
    );
  }
  return (
    <button
      type={type}
      className={cls}
      aria-disabled={isDisabled || undefined}
      aria-busy={isLoading || undefined}
      onClick={handleClick}
      {...rest}
    >
      {isLoading ? <Spinner /> : icon ? <span className="inline-flex shrink-0 [&>svg]:size-5">{icon}</span> : null}
      <span>{label}</span>
    </button>
  );
}
