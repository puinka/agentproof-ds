import { Icon } from '../../icons/Icon';

/**
 * Figma: `Stepper` (+ `Stepper / Step`, `State=Done|Current|Default`).
 * - `Active step` variant → `current` (0-based index); the step count comes from `steps` (Figma fixes it at 4, spec St3).
 * - Done and current bars `background/action`, upcoming `background/neutral`. Labels: done `text/secondary`,
 *   current `text/accent` Semi-bold, upcoming `text/tertiary` (4.8:1; Figma used a dark-background token, 2.6:1, spec St1).
 * - The current step is marked by more than colour: Semi-bold, `aria-current="step"` and "Step n of m".
 */
export interface StepperProps {
  steps: string[];
  /** Index of the current step, 0-based. */
  current: number;
  /** Accessible name of the list. */
  label?: string;
}

export function Stepper({ steps, current, label = 'Progress' }: StepperProps) {
  const n = steps.length;
  return (
    <nav aria-label={label} className="@container">
      {/* Compact form when the container is narrower than 36rem: one bar and the current step in words (Figma Breakpoint=Mobile). */}
      <div className="@xl:hidden flex flex-col gap-1">
        <div className="h-1 w-full rounded-pill bg-neutral" aria-hidden="true">
          <div className="h-1 rounded-pill bg-action" style={{ width: `${((current + 1) / n) * 100}%` }} />
        </div>
        <p className="type-desktop-body-caption-strong text-accent">
          Step {current + 1} of {n}: {steps[current]}
        </p>
      </div>
      <ol className="hidden @xl:flex gap-2 m-0 p-0 list-none">
        {steps.map((s, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
          return (
            <li key={s} className="flex flex-1 flex-col gap-1" aria-current={state === 'current' ? 'step' : undefined}>
              <span aria-hidden="true" className={`h-1 rounded-pill ${state === 'upcoming' ? 'bg-neutral' : 'bg-action'}`} />
              <span
                className={`flex items-center gap-1 ${
                  state === 'done' ? 'text-secondary type-desktop-body-caption-default' : state === 'current' ? 'text-accent type-desktop-body-caption-strong' : 'text-tertiary type-desktop-body-caption-default'
                }`}
              >
                {state === 'done' ? (
                  <Icon name="check-circle" size={16} />
                ) : (
                  <span aria-hidden="true" className={`size-3.5 rounded-pill border-2 ${state === 'current' ? 'border-accent bg-action' : 'border-control'}`} />
                )}
                <span className="sr-only">Step {i + 1} of {n}: </span>
                {s}
                {state === 'done' && <span className="sr-only"> (completed)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
