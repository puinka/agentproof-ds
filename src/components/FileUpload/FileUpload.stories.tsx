import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { FileUpload, type FileUploadStatus, type FileUploadValue } from './FileUpload';

const MB = 1024 * 1024;
const certificate: FileUploadValue = { name: 'registration-certificate-front.jpg', sizeBytes: 2.4 * MB };
// A stand-in thumbnail: a grey card with lines, like a photographed document.
const photo = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><rect width="56" height="56" fill="#d9d9d4"/><rect x="8" y="12" width="40" height="32" rx="2" fill="#f4f4f0"/><rect x="12" y="18" width="20" height="3" fill="#8a8a85"/><rect x="12" y="25" width="32" height="2" fill="#b5b5b0"/><rect x="12" y="30" width="28" height="2" fill="#b5b5b0"/><rect x="12" y="35" width="30" height="2" fill="#b5b5b0"/></svg>',
)}`;
const tooDark = 'We couldn’t read this photo: it’s too dark. Take it again in daylight, with all four corners visible.';

const meta = {
  title: 'Components/FileUpload',
  component: FileUpload,
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  args: {
    label: 'Registration certificate',
    description: 'Front of Part I. JPG, PNG or PDF, up to 10 MB.',
    accept: 'image/jpeg,image/png,application/pdf',
    onSelect: fn(),
    onRemove: fn(),
  },
  decorators: [(Story) => <div className="max-w-content-narrow"><Story /></div>],
} satisfies Meta<typeof FileUpload>;
export default meta;
type Story = StoryObj<typeof meta>;

const input = (root: HTMLElement) => root.querySelector<HTMLInputElement>('input[type="file"]:not([capture])')!;

export const Empty: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('group', { name: 'Registration certificate' })).toBeInTheDocument();
    // The visible button is the control; the native input is hidden from assistive tech and the tab order.
    const choose = c.getByRole('button', { name: 'Choose file' });
    await expect(choose).toHaveAccessibleDescription('Front of Part I. JPG, PNG or PDF, up to 10 MB.');
    await expect(input(canvasElement)).toHaveAttribute('tabindex', '-1');
    await userEvent.upload(input(canvasElement), new File(['x'], 'front.png', { type: 'image/png' }));
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
  },
};

export const Uploading: Story = { args: { file: certificate, status: 'uploading' } };

export const Done: Story = {
  name: 'Uploaded',
  args: { file: { ...certificate, previewUrl: photo }, status: 'done' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Uploaded')).toBeInTheDocument();
    await expect(c.getByRole('button', { name: `Remove ${certificate.name}` })).toBeInTheDocument();
    await expect(c.getByRole('button', { name: 'Replace file' })).toBeInTheDocument();
  },
};

/** The S2 screen from build-run D: the server couldn't read the photo. The error belongs to this control. */
export const NotAccepted: Story = {
  name: 'Not accepted (error)',
  args: { file: certificate, status: 'error', error: tooDark, capture: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toHaveTextContent(tooDark);
    await expect(c.getByText('Not accepted')).toBeInTheDocument();
    // The retry actions carry the reason, so a screen reader hears it on the button.
    const retake = c.getByRole('button', { name: 'Take a new photo' });
    await expect(retake.getAttribute('aria-describedby') ?? '').toMatch(/err/);
    await expect(c.getByRole('button', { name: 'Replace file' })).toBeInTheDocument();
  },
};

export const WithCamera: Story = {
  name: 'With “Take a photo”',
  args: { capture: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Take a photo' })).toBeInTheDocument();
    await expect(canvasElement.querySelector('input[capture="environment"]')).not.toBeNull();
  },
};

/** Checked before `onSelect`: a file over the limit never reaches your handler. */
export const TooLarge: Story = {
  name: 'File too large',
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const big = new File(['x'], 'scan.pdf', { type: 'application/pdf' });
    Object.defineProperty(big, 'size', { value: 14.2 * MB });
    await userEvent.upload(input(canvasElement), big);
    await expect(await c.findByRole('alert')).toHaveTextContent('scan.pdf is 14.2 MB. The limit is 10 MB.');
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};

/** Dropped files skip the picker's filter, so the type is checked again. */
export const WrongTypeDropped: Story = {
  name: 'Wrong type, dropped',
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const zone = c.getByText('Drag a file here, or').parentElement!;
    const dt = new DataTransfer();
    dt.items.add(new File(['x'], 'notes.txt', { type: 'text/plain' }));
    // A real DragEvent: testing-library's fireEvent copies DataTransfer own props, which drops `files`.
    zone.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
    await expect(await c.findByRole('alert')).toHaveTextContent('notes.txt isn’t a supported file type.');
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = { args: { isDisabled: true, description: 'Available after you add a vehicle.' } };

function Flow(props: Partial<React.ComponentProps<typeof FileUpload>>) {
  const [file, setFile] = useState<FileUploadValue | null>(null);
  const [status, setStatus] = useState<FileUploadStatus>('idle');
  useEffect(() => {
    if (status !== 'uploading') return;
    const t = setTimeout(() => setStatus('done'), 400);
    return () => clearTimeout(t);
  }, [status]);
  return (
    <FileUpload
      label="Registration certificate"
      description="Front of Part I. JPG, PNG or PDF, up to 10 MB."
      accept="image/jpeg,image/png,application/pdf"
      capture
      {...props}
      file={file}
      status={status}
      onSelect={(f) => { setFile({ name: f.name, sizeBytes: f.size }); setStatus('uploading'); }}
      onRemove={() => { setFile(null); setStatus('idle'); }}
    />
  );
}

/** The whole loop: choose, upload, remove. Status changes are announced politely. */
export const Interactive: Story = {
  name: 'Choose, upload, remove',
  render: () => <Flow />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.upload(input(canvasElement), new File(['x'], 'front.pdf', { type: 'application/pdf' }));
    await expect(c.getByText('Uploading front.pdf…')).toBeInTheDocument();
    await expect(await c.findByText('front.pdf uploaded', {}, { timeout: 2000 })).toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Remove front.pdf' }));
    // Focus doesn't fall to the page start when the row disappears.
    await expect(c.getByRole('button', { name: 'Choose file' })).toHaveFocus();
  },
};

export const Mobile: Story = {
  name: 'Mobile',
  args: { file: certificate, status: 'error', error: tooDark, capture: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
