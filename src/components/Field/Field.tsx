import { createContext, useContext, useId, type ReactNode } from 'react';
import { ValidationMessage } from './ValidationMessage';

export type FieldStatus = 'none' | 'error' | 'warning' | 'success';

interface FieldContextValue {
  inputId: string;
  describedBy: string | undefined;
  status: FieldStatus;
  isRequired: boolean;
  isDisabled: boolean;
}
const FieldContext = createContext<FieldContextValue | null>(null);

/** For controls inside a Field: ids, status and flags. Returns null outside a Field. */
export const useField = () => useContext(FieldContext);

export interface FieldProps {
  /** Required. Always visible; a placeholder never replaces it. */
  label: string;
  /** The control: TextInput (or another control that reads `useField`). */
  children: ReactNode;
  /** Help that is always shown under the label's control. */
  description?: string;
  /** Validation status. Error and success colour the control's border; warning keeps it neutral. */
  status?: FieldStatus;
  /** The status message. Required when status is not "none": colour alone never carries meaning. */
  message?: string;
  /** Sets aria-required on the control. Not marked visually; mark the exceptions instead (`isOptional`). */
  isRequired?: boolean;
  /** Adds "(optional)" to the label. Use when most fields in the form are required. */
  isOptional?: boolean;
  isDisabled?: boolean;
  className?: string;
}

/**
 * Figma: `Field` (`Status=None|Error|Warning|Success`, `Label`, `Optional`, `Description`, `Message`).
 * Owns label, description and status message for any control, as in Astryx. Replaces `Input&Label`.
 */
export function Field({
  label,
  children,
  description,
  status = 'none',
  message,
  isRequired = false,
  isOptional = false,
  isDisabled = false,
  className,
}: FieldProps) {
  const id = useId();
  const inputId = `${id}-control`;
  const descId = description ? `${id}-description` : undefined;
  const msgId = status !== 'none' && message ? `${id}-message` : undefined;
  if (status !== 'none' && !message && import.meta.env?.DEV) {
    console.warn(`[Field] status="${status}" needs a message.`);
  }
  const describedBy = [descId, msgId].filter(Boolean).join(' ') || undefined;
  return (
    <FieldContext.Provider value={{ inputId, describedBy, status, isRequired, isDisabled }}>
      <div className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}>
        <label htmlFor={inputId} className={`type-desktop-body-caption-strong ${isDisabled ? 'text-disabled' : 'text-primary'}`}>
          {label}
          {isOptional && <span className="type-desktop-body-caption-default text-tertiary"> (optional)</span>}
        </label>
        {children}
        {description && (
          <p id={descId} className="type-desktop-body-caption-default text-tertiary">
            {description}
          </p>
        )}
        <ValidationMessage id={msgId} status={status === 'none' ? undefined : status}>{status !== 'none' ? message : null}</ValidationMessage>
      </div>
    </FieldContext.Provider>
  );
}
