import { useEffect, useId, useRef, useState, type DragEvent } from 'react';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { Icon } from '../../icons/Icon';

/**
 * FileUpload: one file the user sends us (a document photo, a PDF). Added after build-run D, where
 * 6/6 agents hand-built a hidden file input for the same job.
 *
 * - The result of the upload is a state of this control, like a field error: `status="error"` with a
 *   message that says what went wrong and what to do ("The photo is too dark. Take it again in daylight").
 *   Use a page Banner only for a problem with the whole page.
 * - Status changes are announced: "Uploading…", "Uploaded" politely, an error assertively.
 * - The buttons are real buttons; the native input is hidden and never focused.
 * - After "Remove", focus moves to "Choose file", so keyboard users don't land on the page start.
 * - `capture` adds "Take a photo", which opens the camera on phones (`capture="environment"`).
 * - Type and size are checked before `onSelect`; a wrong file never reaches your handler.
 */
export type FileUploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export interface FileUploadValue {
  name: string;
  sizeBytes: number;
  /** Object URL or remote URL of an image preview. Without it, a document icon is shown. */
  previewUrl?: string;
}

export interface FileUploadProps {
  label: string;
  /** What we need and the accepted formats: "Front of Part I. JPG, PNG or PDF, up to 10 MB." */
  description?: string;
  /** Passed to the input, e.g. "image/*,application/pdf". Also checked on drop. */
  accept?: string;
  maxSizeMb?: number;
  /** Shows a "Take a photo" button that opens the rear camera on phones. */
  capture?: boolean;
  file?: FileUploadValue | null;
  status?: FileUploadStatus;
  /** Required when status is "error". What happened and what to do. */
  error?: string;
  onSelect: (file: File) => void;
  onRemove?: () => void;
  isDisabled?: boolean;
  className?: string;
}

const formatSize = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  return accept.split(',').map((a) => a.trim().toLowerCase()).some((a) =>
    a.startsWith('.') ? file.name.toLowerCase().endsWith(a) : a.endsWith('/*') ? file.type.startsWith(a.slice(0, -1)) : file.type === a,
  );
}

export function FileUpload({
  label, description, accept, maxSizeMb = 10, capture = false, file, status = 'idle', error, onSelect, onRemove,
  isDisabled = false, className,
}: FileUploadProps) {
  const id = useId();
  const pick = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hadFile = useRef(!!file);
  // The Remove button disappears with the file row: hand focus to the first button of the empty state.
  useEffect(() => {
    if (hadFile.current && !file) {
      const active = document.activeElement;
      if (!active || active === document.body || rootRef.current?.contains(active)) {
        rootRef.current?.querySelector<HTMLButtonElement>('[role="group"] button')?.focus();
      }
    }
    hadFile.current = !!file;
  }, [file]);

  const take = (f: File | undefined) => {
    if (!f) return;
    if (!matchesAccept(f, accept)) return setLocalError(`${f.name} isn’t a supported file type. ${description ?? ''}`.trim());
    if (f.size > maxSizeMb * 1024 * 1024) return setLocalError(`${f.name} is ${formatSize(f.size)}. The limit is ${maxSizeMb} MB.`);
    setLocalError(null);
    onSelect(f);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!isDisabled) take(e.dataTransfer.files[0]);
  };

  const shownError = localError ?? (status === 'error' ? error : undefined);
  const descId = description ? `${id}-desc` : undefined;
  const errId = shownError ? `${id}-err` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(' ') || undefined;
  const statusText = status === 'uploading' ? `Uploading ${file?.name ?? 'file'}…` : status === 'done' ? `${file?.name ?? 'File'} uploaded` : '';

  const buttons = (replace: boolean) => (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="ghost"
        size="sm"
        label={replace ? 'Replace file' : 'Choose file'}
        icon={<Icon name="arrow-up-tray" size={20} />}
        isDisabled={isDisabled || status === 'uploading'}
        onClick={() => pick.current?.click()}
        aria-describedby={describedBy}
      />
      {capture && (
        <Button
          variant="ghost"
          size="sm"
          label={replace ? 'Take a new photo' : 'Take a photo'}
          icon={<Icon name="camera" size={20} />}
          isDisabled={isDisabled || status === 'uploading'}
          onClick={() => camera.current?.click()}
          aria-describedby={describedBy}
        />
      )}
    </div>
  );

  return (
    <div ref={rootRef} className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}>
      <p id={`${id}-label`} className={`m-0 type-desktop-body-caption-strong ${isDisabled ? 'text-disabled' : 'text-primary'}`}>{label}</p>
      {description && <p id={descId} className="m-0 type-desktop-body-caption-default text-tertiary">{description}</p>}

      <input ref={pick} type="file" accept={accept} className="sr-only" tabIndex={-1} aria-hidden="true" disabled={isDisabled}
        onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }} />
      {capture && (
        <input ref={camera} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden="true" disabled={isDisabled}
          onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }} />
      )}

      <div role="group" aria-labelledby={`${id}-label`}>
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); if (!isDisabled) setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={[
              'flex flex-col items-center gap-3 rounded-container border border-dashed p-6 text-center',
              // Disabled stays on surface, like a disabled RadioList tile: text-disabled on bg-disabled is under 4.5:1.
              isDisabled ? 'border-disabled bg-surface' : dragging ? 'border-accent bg-accent-subtle' : shownError ? 'border-error bg-surface' : 'border-control bg-surface',
            ].join(' ')}
          >
            <Icon name="arrow-up-tray" size={24} className={isDisabled ? 'text-disabled' : 'text-secondary'} />
            <p className={`m-0 type-desktop-body-caption-default ${isDisabled ? 'text-disabled' : 'text-secondary'}`}>Drag a file here, or</p>
            {buttons(false)}
          </div>
        ) : (
          <div className={`flex flex-col gap-4 rounded-container border bg-surface p-4 ${status === 'error' ? 'border-error' : 'border-subtle'}`}>
            <div className="flex min-w-0 flex-1 items-center gap-4">
              {file.previewUrl ? (
                <img src={file.previewUrl} alt="" className="size-14 shrink-0 rounded-inner border border-subtle object-cover" />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-inner bg-muted text-secondary" aria-hidden="true">
                  <Icon name="document" size={24} />
                </span>
              )}
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate type-desktop-body-caption-strong text-primary">{file.name}</span>
                <span className="flex flex-wrap items-center gap-2 type-desktop-body-caption-default text-tertiary">
                  {formatSize(file.sizeBytes)}
                  {status === 'uploading' && <Badge label="Uploading" />}
                  {status === 'done' && <Badge status="success" label="Uploaded" />}
                  {status === 'error' && <Badge status="error" label="Not accepted" />}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {buttons(true)}
              {onRemove && status !== 'uploading' && (
                <Button variant="link" label="Remove" aria-label={`Remove ${file.name}`} onClick={onRemove} isDisabled={isDisabled} />
              )}
            </div>
          </div>
        )}
      </div>

      {shownError && (
        <p id={errId} role="alert" className="m-0 flex items-start gap-1.5 type-desktop-body-caption-default text-error">
          <Icon name="exclamation-circle" size={20} className="shrink-0" />
          <span>{shownError}</span>
        </p>
      )}
      <p className="sr-only" aria-live="polite">{statusText}</p>
    </div>
  );
}
