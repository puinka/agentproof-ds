import type { SVGProps } from 'react';

// Heroicons outline (MIT), the set used in the Figma file (`Icon / …`).
// Icons draw with currentColor, so they always take the colour of their parent's text.
// This is the code-side fix for design.md G21 (swapped icons keep their own colour in Figma).
const paths = {
  'chevron-right': 'm8.25 4.5 7.5 7.5-7.5 7.5',
  'chevron-down': 'm19.5 8.25-7.5 7.5-7.5-7.5',
  'chevron-up': 'm4.5 15.75 7.5-7.5 7.5 7.5',
  'chevron-up-down': 'M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9',
  'arrow-right': 'M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3',
  plus: 'M12 4.5v15m7.5-7.5h-15',
  trash:
    'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
  check: 'm4.5 12.75 6 6 9-13.5',
  'bars-3': 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
  'x-mark': 'M6 18 18 6M6 6l12 12',
  'exclamation-circle': 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z',
  'exclamation-triangle':
    'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  'check-circle': 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  'information-circle':
    'm11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
} as const;

export type IconName = keyof typeof paths;
export const iconNames = Object.keys(paths) as IconName[];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** Icon name, same as the Figma component `Icon / {name}`. */
  name: IconName;
  /** Rendered size in px. 20 inside buttons, 24 on its own. */
  size?: 16 | 20 | 24;
}

/** Decorative by default (`aria-hidden`). The control that holds it provides the accessible name. */
export function Icon({ name, size = 24, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
