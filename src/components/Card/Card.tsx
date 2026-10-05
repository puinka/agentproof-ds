import type { ElementType, HTMLAttributes, ReactNode } from 'react';

/**
 * Figma: `Card` holds five patterns as `Type=Article|CTA|Team member|Feature card|Event`.
 * In code they are compositions of this one container (spec Ca3), as in Astryx.
 * - One primary action per card. If the whole card is a link, no nested buttons.
 * - On `accent` and `accent-strong` tones, text is `text-inverse` / `text-on-accent` and buttons use `onDark`.
 */
export interface CardProps extends HTMLAttributes<HTMLElement> {
  tone?: 'surface' | 'muted' | 'accent' | 'accent-strong';
  padding?: 'none' | 'compact' | 'default' | 'spacious';
  /** `md` = `Box Shadow/shadow-md`, used by the Article pattern. */
  elevation?: 'none' | 'md';
  as?: ElementType;
  children: ReactNode;
}

const tones = {
  surface: 'bg-surface text-primary border border-subtle',
  muted: 'bg-muted text-primary',
  accent: 'bg-accent text-inverse',
  'accent-strong': 'bg-accent-strong text-inverse',
} as const;
const pads = { none: 'p-0', compact: 'p-4', default: 'p-6', spacious: 'p-8' } as const;

export function Card({ tone = 'surface', padding = 'default', elevation = 'none', as: Tag = 'article', className, children, ...rest }: CardProps) {
  return (
    <Tag className={['flex flex-col gap-4 overflow-hidden rounded-container', tones[tone], pads[padding], elevation === 'md' ? 'shadow-md' : '', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Tag>
  );
}
