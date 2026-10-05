import type { Preview } from '@storybook/react-vite';
import '../src/styles/fonts';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    // Fail the a11y panel on violations instead of only listing them.
    a11y: { test: 'error' },
    options: { storySort: { order: ['About this project', 'Foundations', 'Components', 'Patterns'] } },
  },
  tags: ['autodocs'],
};
export default preview;
