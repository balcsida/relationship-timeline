import { describe, test, expect, mock } from 'bun:test';
import { render, fireEvent } from '@/test/test-utils';
import EventFormDialog from './EventFormDialog';

describe('EventFormDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: mock(() => {}),
    editingEvent: null,
  };

  test('renders add event form when open', () => {
    render(<EventFormDialog {...defaultProps} />);
    expect(document.body.textContent).toContain('Add Event');
  });

  test('renders edit event form when editing', () => {
    const event = { id: 1, description: 'Test', score: 5, date: '2024-01-15', monthOnly: false };
    render(<EventFormDialog {...defaultProps} editingEvent={event} />);
    expect(document.body.textContent).toContain('Edit Event');
  });

  test('populates form with event data when editing', () => {
    const event = { id: 1, description: 'Test event', score: 5, date: '2024-01-15', monthOnly: false };
    render(<EventFormDialog {...defaultProps} editingEvent={event} />);
    const descInput = document.body.querySelector('#description');
    expect(descInput.value).toBe('Test event');
  });

  test('calls onOpenChange(false) when cancel is clicked', () => {
    const onOpenChange = mock(() => {});
    render(<EventFormDialog {...defaultProps} onOpenChange={onOpenChange} />);
    const cancelButton = [...document.body.querySelectorAll('button')].find(b => b.textContent.includes('Cancel'));
    fireEvent.click(cancelButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
