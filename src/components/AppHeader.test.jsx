import { describe, test, expect, mock } from 'bun:test';
import { render, fireEvent } from '@/test/test-utils';
import AppHeader from './AppHeader';

describe('AppHeader', () => {
  const defaultProps = {
    onAddEvent: mock(() => {}),
    onOpenSettings: mock(() => {}),
  };

  test('renders the app title', () => {
    const { container } = render(<AppHeader {...defaultProps} />);
    expect(container.textContent).toContain('Relationship Timeline');
  });

  test('renders language toggle button', () => {
    const { container } = render(<AppHeader {...defaultProps} />);
    const langButton = [...container.querySelectorAll('button')].find(b => b.textContent.includes('HU'));
    expect(langButton).toBeTruthy();
  });

  test('calls onAddEvent when add button is clicked', () => {
    const onAddEvent = mock(() => {});
    const { container } = render(<AppHeader {...defaultProps} onAddEvent={onAddEvent} />);
    const addButton = [...container.querySelectorAll('button')].find(b => b.textContent.includes('Add Event'));
    fireEvent.click(addButton);
    expect(onAddEvent).toHaveBeenCalled();
  });

  test('calls onOpenSettings when settings button is clicked', () => {
    const onOpenSettings = mock(() => {});
    const { container } = render(<AppHeader {...defaultProps} onOpenSettings={onOpenSettings} />);
    const buttons = container.querySelectorAll('button');
    const settingsButton = [...buttons].find(b =>
      !b.textContent.includes('HU') &&
      !b.textContent.includes('EN') &&
      !b.textContent.includes('Add Event') &&
      !b.textContent.includes('Esemény')
    );
    fireEvent.click(settingsButton);
    expect(onOpenSettings).toHaveBeenCalled();
  });
});
