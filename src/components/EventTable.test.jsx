import { describe, test, expect, mock } from 'bun:test';
import { render } from '@/test/test-utils';
import EventTable from './EventTable';

describe('EventTable', () => {
  const defaultProps = {
    registerTableRowRef: mock(() => {}),
    onEditEvent: mock(() => {}),
    onDeleteEvent: mock(() => {}),
  };

  test('shows empty state when no events', () => {
    const { container } = render(<EventTable {...defaultProps} />);
    expect(container.textContent).toContain('No events yet');
  });

  test('renders events from context', () => {
    const events = [
      { id: 1, description: 'First event', score: 3, date: '2024-01-15', displayDate: '2024-01-15', monthOnly: false },
      { id: 2, description: 'Second event', score: -2, date: '2024-02-20', displayDate: '2024-02-20', monthOnly: false },
    ];
    localStorage.setItem('relationshipEvents', JSON.stringify(events));
    const { container } = render(<EventTable {...defaultProps} />);
    expect(container.textContent).toContain('First event');
    expect(container.textContent).toContain('Second event');
  });

  test('displays formatted scores', () => {
    const events = [
      { id: 1, description: 'Good event', score: 5, date: '2024-01-15', displayDate: '2024-01-15', monthOnly: false },
    ];
    localStorage.setItem('relationshipEvents', JSON.stringify(events));
    const { container } = render(<EventTable {...defaultProps} />);
    expect(container.textContent).toContain('+5');
  });
});
