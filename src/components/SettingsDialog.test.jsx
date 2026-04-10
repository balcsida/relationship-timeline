import { describe, test, expect, mock } from 'bun:test';
import { render } from '@/test/test-utils';
import SettingsDialog from './SettingsDialog';

describe('SettingsDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: mock(() => {}),
    onOpenPrint: mock(() => {}),
  };

  test('renders settings title when open', () => {
    render(<SettingsDialog {...defaultProps} />);
    expect(document.body.textContent).toContain('Settings');
  });

  test('renders chart style options', () => {
    render(<SettingsDialog {...defaultProps} />);
    expect(document.body.textContent).toContain('Curved');
    expect(document.body.textContent).toContain('Straight');
  });

  test('renders export and import buttons', () => {
    render(<SettingsDialog {...defaultProps} />);
    expect(document.body.textContent).toContain('Export JSON');
    expect(document.body.textContent).toContain('Import JSON');
  });

  test('renders danger zone with clear button', () => {
    render(<SettingsDialog {...defaultProps} />);
    expect(document.body.textContent).toContain('Clear All Events');
  });

  test('renders print timeline button', () => {
    render(<SettingsDialog {...defaultProps} />);
    expect(document.body.textContent).toContain('Print Timeline');
  });
});
