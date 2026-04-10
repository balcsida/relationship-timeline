import { describe, test, expect, mock } from 'bun:test';
import { render } from '@/test/test-utils';
import VerticalTimeline from './VerticalTimeline';

describe('VerticalTimeline', () => {
  const defaultProps = {
    registerTimelineRef: mock(() => {}),
  };

  test('shows empty state when no events', () => {
    const { container } = render(<VerticalTimeline {...defaultProps} />);
    expect(container.textContent).toContain('No events yet');
  });

  test('renders events from context', () => {
    const events = [
      { id: 1, description: 'Timeline event', score: 4, date: '2024-03-10', displayDate: '2024-03-10', monthOnly: false },
    ];
    localStorage.setItem('relationshipEvents', JSON.stringify(events));
    const { container } = render(<VerticalTimeline {...defaultProps} />);
    expect(container.textContent).toContain('Timeline event');
    expect(container.textContent).toContain('+4');
  });

  test('renders event dates', () => {
    const events = [
      { id: 1, description: 'Dated event', score: 0, date: '2024-06-01', displayDate: '2024-06-01', monthOnly: false },
    ];
    localStorage.setItem('relationshipEvents', JSON.stringify(events));
    const { container } = render(<VerticalTimeline {...defaultProps} />);
    expect(container.textContent).toContain('2024-06-01');
  });
});
