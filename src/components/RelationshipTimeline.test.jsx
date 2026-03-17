import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, screen, fireEvent, waitFor, within } from '../test/test-utils';
import RelationshipTimeline from './RelationshipTimeline';
import '../test/setup.bun';

// Helper to get the main (non-print) container
function getMainContainer() {
  return document.querySelector('.no-print');
}

// Helper to add an event via the form using fireEvent
function addEvent(description, score = 0, date = null) {
  const container = getMainContainer();
  const w = within(container);
  const descriptionInput = w.getByLabelText(/Event Description/i);
  const scoreInput = w.getByLabelText(/Satisfaction Score/i);
  const addButton = w.getByRole('button', { name: /Add Event/i });

  fireEvent.change(descriptionInput, { target: { value: description } });
  fireEvent.change(scoreInput, { target: { value: String(score) } });
  if (date) {
    const dateInput = w.getByLabelText(/Date/i);
    fireEvent.change(dateInput, { target: { value: date } });
  }
  fireEvent.click(addButton);
}

describe('RelationshipTimeline Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the main title', () => {
      render(<RelationshipTimeline />);
      const container = getMainContainer();
      expect(within(container).getByText('Relationship Timeline')).toBeInTheDocument();
    });

    it('should render the form elements', () => {
      render(<RelationshipTimeline />);
      const container = getMainContainer();
      const w = within(container);
      expect(w.getByLabelText(/Event Description/i)).toBeInTheDocument();
      expect(w.getByLabelText(/Satisfaction Score/i)).toBeInTheDocument();
      expect(w.getByLabelText(/Date/i)).toBeInTheDocument();
      expect(w.getByRole('button', { name: /Add Event/i })).toBeInTheDocument();
    });

    it('should show empty state message when no events', () => {
      render(<RelationshipTimeline />);
      expect(screen.getByText(/No events yet/i)).toBeInTheDocument();
    });

    it('should render score guide', () => {
      render(<RelationshipTimeline />);
      expect(screen.getByText('Score Guide')).toBeInTheDocument();
      expect(screen.getByText('+8: Extremely Happy')).toBeInTheDocument();
      expect(screen.getByText('-8: Extremely Unhappy')).toBeInTheDocument();
    });
  });

  describe('Adding Events', () => {
    it('should add a new event when form is submitted', () => {
      render(<RelationshipTimeline />);
      addEvent('First date', 7);

      const container = getMainContainer();
      const w = within(container);
      expect(w.getByText('First date')).toBeInTheDocument();
      expect(w.getByText('+7')).toBeInTheDocument();
    });

    it('should clear form after adding event', () => {
      render(<RelationshipTimeline />);
      addEvent('Anniversary', 8);

      const container = getMainContainer();
      const w = within(container);
      const descriptionInput = w.getByLabelText(/Event Description/i);
      const scoreInput = w.getByLabelText(/Satisfaction Score/i);
      expect(descriptionInput.value).toBe('');
      expect(scoreInput.value).toBe('0');
    });

    it('should sort events by date', () => {
      render(<RelationshipTimeline />);
      addEvent('Later Event', 0, '2024-12-01');
      addEvent('Earlier Event', 0, '2024-01-01');

      const container = getMainContainer();
      const eventItems = container.querySelectorAll('.font-medium');
      const eventTexts = Array.from(eventItems).map(el => el.textContent).filter(t => t.endsWith('Event'));
      expect(eventTexts[0]).toBe('Earlier Event');
      expect(eventTexts[1]).toBe('Later Event');
    });

    it('should handle month-only dates', () => {
      render(<RelationshipTimeline />);

      const container = getMainContainer();
      const w = within(container);
      const descriptionInput = w.getByLabelText(/Event Description/i);
      const monthOnlyCheckbox = w.getByLabelText(/Month only/i);
      const addButton = w.getByRole('button', { name: /Add Event/i });

      fireEvent.change(descriptionInput, { target: { value: 'Monthly Event' } });
      fireEvent.click(monthOnlyCheckbox);
      fireEvent.click(addButton);

      expect(w.getByText('Monthly Event')).toBeInTheDocument();
    });
  });

  describe('Editing Events', () => {
    beforeEach(() => {
      render(<RelationshipTimeline />);
      addEvent('Test Event');
    });

    function clickEditButton() {
      const container = getMainContainer();
      const editButtons = container.querySelectorAll('button svg.lucide-pen');
      fireEvent.click(editButtons[0].closest('button'));
    }

    it('should enter edit mode when edit button is clicked', () => {
      clickEditButton();
      const container = getMainContainer();
      const w = within(container);
      expect(w.getByRole('button', { name: /Update/i })).toBeInTheDocument();
      expect(w.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should populate form with event data when editing', () => {
      clickEditButton();
      const container = getMainContainer();
      const descriptionInput = within(container).getByLabelText(/Event Description/i);
      expect(descriptionInput.value).toBe('Test Event');
    });

    it('should update event when update button is clicked', () => {
      clickEditButton();

      const container = getMainContainer();
      const w = within(container);
      const descriptionInput = w.getByLabelText(/Event Description/i);
      fireEvent.change(descriptionInput, { target: { value: 'Updated Event' } });

      const updateButton = w.getByRole('button', { name: /Update/i });
      fireEvent.click(updateButton);

      expect(w.getByText('Updated Event')).toBeInTheDocument();
      expect(w.queryByText('Test Event')).not.toBeInTheDocument();
    });

    it('should cancel editing when cancel button is clicked', () => {
      clickEditButton();

      const container = getMainContainer();
      const w = within(container);
      const descriptionInput = w.getByLabelText(/Event Description/i);
      fireEvent.change(descriptionInput, { target: { value: 'Changed Event' } });

      const cancelButton = w.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(w.getByText('Test Event')).toBeInTheDocument();
      expect(descriptionInput.value).toBe('');
    });
  });

  describe('Deleting Events', () => {
    beforeEach(() => {
      render(<RelationshipTimeline />);
      addEvent('Event to Delete');
    });

    it('should delete event when delete button is clicked and confirmed', () => {
      window.confirm = mock(() => true);

      const container = getMainContainer();
      const deleteButtons = container.querySelectorAll('button svg.lucide-trash2');
      fireEvent.click(deleteButtons[0].closest('button'));

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this event?');
      expect(within(container).queryByText('Event to Delete')).not.toBeInTheDocument();
    });

    it('should not delete event when deletion is cancelled', () => {
      window.confirm = mock(() => false);

      const container = getMainContainer();
      const deleteButtons = container.querySelectorAll('button svg.lucide-trash2');
      fireEvent.click(deleteButtons[0].closest('button'));

      expect(window.confirm).toHaveBeenCalled();
      expect(within(container).getByText('Event to Delete')).toBeInTheDocument();
    });
  });

  describe('Language Toggle', () => {
    it('should toggle between English and Hungarian', () => {
      render(<RelationshipTimeline />);

      const container = getMainContainer();
      const w = within(container);
      const langButton = w.getByRole('button', { name: /HU/i });
      fireEvent.click(langButton);

      expect(w.getByText('Kapcsolat Idővonal')).toBeInTheDocument();
      expect(w.getByText('Esemény Hozzáadása')).toBeInTheDocument();

      const engButton = w.getByRole('button', { name: /EN/i });
      fireEvent.click(engButton);

      expect(w.getByText('Relationship Timeline')).toBeInTheDocument();
      expect(w.getByText('Add Event')).toBeInTheDocument();
    });

    it('should persist language preference in localStorage', () => {
      render(<RelationshipTimeline />);

      const container = getMainContainer();
      const langButton = within(container).getByRole('button', { name: /HU/i });
      fireEvent.click(langButton);

      expect(localStorage.getItem('appLanguage')).toBe('hu');
    });
  });

  describe('Data Persistence', () => {
    it('should save events to localStorage', () => {
      render(<RelationshipTimeline />);
      addEvent('Persistent Event');

      const savedEvents = JSON.parse(localStorage.getItem('relationshipEvents'));
      expect(savedEvents).toHaveLength(1);
      expect(savedEvents[0].description).toBe('Persistent Event');
    });

    it('should load events from localStorage on mount', () => {
      const mockEvents = [
        {
          id: 1,
          description: 'Loaded Event',
          score: 5,
          date: '2024-01-01',
          displayDate: '2024-01-01',
          monthOnly: false
        }
      ];

      localStorage.setItem('relationshipEvents', JSON.stringify(mockEvents));
      render(<RelationshipTimeline />);

      const container = getMainContainer();
      const w = within(container);
      expect(w.getByText('Loaded Event')).toBeInTheDocument();
      expect(w.getByText('+5')).toBeInTheDocument();
    });
  });

  describe('Import/Export Functionality', () => {
    beforeEach(() => {
      render(<RelationshipTimeline />);
      addEvent('Export Test Event');
    });

    it('should have export button', () => {
      const container = getMainContainer();
      expect(within(container).getByRole('button', { name: /Export Data/i })).toBeInTheDocument();
    });

    it('should trigger download when export button is clicked', () => {
      const originalCreateElement = document.createElement.bind(document);
      const createdElements = [];
      document.createElement = (tag) => {
        const el = originalCreateElement(tag);
        createdElements.push(el);
        return el;
      };

      const container = getMainContainer();
      const exportButton = within(container).getByRole('button', { name: /Export Data/i });
      fireEvent.click(exportButton);

      const link = createdElements.find(el => el.tagName === 'A');
      expect(link).toBeDefined();
      expect(link.download).toMatch(/relationship-timeline-.*\.json/);

      document.createElement = originalCreateElement;
    });

    it('should import data from file', async () => {
      window.alert = mock();

      const importData = [
        {
          id: 2,
          description: 'Imported Event',
          score: -3,
          date: '2024-06-01',
          displayDate: '2024-06-01',
          monthOnly: false
        }
      ];

      const file = new File([JSON.stringify(importData)], 'test.json', {
        type: 'application/json',
      });

      const container = getMainContainer();
      const importInput = container.querySelector('input[type="file"]');

      Object.defineProperty(importInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(importInput);

      await waitFor(() => {
        expect(within(container).getByText('Imported Event')).toBeInTheDocument();
      });

      expect(window.alert).toHaveBeenCalledWith('Data imported successfully!');
    });

    it('should show error for invalid import file', async () => {
      window.alert = mock();

      const file = new File(['invalid json'], 'test.json', {
        type: 'application/json',
      });

      const container = getMainContainer();
      const importInput = container.querySelector('input[type="file"]');

      Object.defineProperty(importInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(importInput);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Error importing data. Please check the file format.');
      });
    });
  });

  describe('JSON View', () => {
    beforeEach(() => {
      render(<RelationshipTimeline />);
      addEvent('JSON Test Event');
    });

    it('should toggle JSON view', () => {
      const container = getMainContainer();
      const w = within(container);
      const viewJsonButton = w.getByRole('button', { name: /View JSON/i });

      fireEvent.click(viewJsonButton);
      expect(w.getByText('JSON Data')).toBeInTheDocument();

      fireEvent.click(viewJsonButton);
      expect(w.queryByText('JSON Data')).not.toBeInTheDocument();
    });

    it('should copy JSON to clipboard', async () => {
      const mockWriteText = mock(() => Promise.resolve(undefined));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const container = getMainContainer();
      const w = within(container);
      const viewJsonButton = w.getByRole('button', { name: /View JSON/i });
      fireEvent.click(viewJsonButton);

      const copyButton = w.getByRole('button', { name: /Copy JSON/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
      });
    });
  });

  describe('Timeline Visualization', () => {
    it('should show timeline when events exist', () => {
      render(<RelationshipTimeline />);
      addEvent('Chart Event');
      const container = getMainContainer();
      expect(within(container).getByText('Timeline')).toBeInTheDocument();
    });

    it('should toggle line style', () => {
      render(<RelationshipTimeline />);
      addEvent('Style Test');

      const container = getMainContainer();
      const w = within(container);
      const styleButton = w.getByRole('button', { name: /Line Style/i });
      expect(styleButton).toHaveTextContent('Curved');

      fireEvent.click(styleButton);
      expect(styleButton).toHaveTextContent('Straight');
    });
  });

  describe('Score Display', () => {
    it('should display positive scores with + prefix', () => {
      render(<RelationshipTimeline />);
      addEvent('Positive Event', 5);
      const container = getMainContainer();
      expect(within(container).getByText('+5')).toBeInTheDocument();
    });

    it('should display negative scores with - prefix', () => {
      render(<RelationshipTimeline />);
      addEvent('Negative Event', -3);
      const container = getMainContainer();
      expect(within(container).getByText('-3')).toBeInTheDocument();
    });

    it('should display zero scores without prefix', () => {
      render(<RelationshipTimeline />);
      addEvent('Neutral Event', 0);

      const container = getMainContainer();
      const scoreElements = within(container).getAllByText('0');
      const eventScore = scoreElements.find(el =>
        el.closest('.font-medium') !== null
      );
      expect(eventScore).toBeInTheDocument();
    });
  });
});
