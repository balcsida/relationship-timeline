import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RelationshipTimeline from './RelationshipTimeline';

describe('RelationshipTimeline Component', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the main title', () => {
      render(<RelationshipTimeline />);
      expect(screen.getByText('Relationship Timeline')).toBeInTheDocument();
    });

    it('should render the form elements', () => {
      render(<RelationshipTimeline />);
      expect(screen.getByLabelText(/Event Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Satisfaction Score/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add Event/i })).toBeInTheDocument();
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
    it('should add a new event when form is submitted', async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const scoreInput = screen.getByLabelText(/Satisfaction Score/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });

      await user.type(descriptionInput, 'First date');
      fireEvent.change(scoreInput, { target: { value: '7' } });
      await user.click(addButton);

      expect(screen.getByText('First date')).toBeInTheDocument();
      expect(screen.getByText('+7')).toBeInTheDocument();
    });

    it('should clear form after adding event', async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const scoreInput = screen.getByLabelText(/Satisfaction Score/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });

      await user.type(descriptionInput, 'Anniversary');
      fireEvent.change(scoreInput, { target: { value: '8' } });
      await user.click(addButton);

      expect(descriptionInput.value).toBe('');
      expect(scoreInput.value).toBe('0');
    });

    it('should sort events by date', async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const dateInput = screen.getByLabelText(/Date/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });

      // Add event with later date
      await user.type(descriptionInput, 'Later Event');
      fireEvent.change(dateInput, { target: { value: '2024-12-01' } });
      await user.click(addButton);

      // Add event with earlier date
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Earlier Event');
      fireEvent.change(dateInput, { target: { value: '2024-01-01' } });
      await user.click(addButton);

      const events = screen.getAllByText(/Event$/);
      expect(events[0]).toHaveTextContent('Earlier Event');
      expect(events[1]).toHaveTextContent('Later Event');
    });

    it('should handle month-only dates', async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const monthOnlyCheckbox = screen.getByLabelText(/Month only/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });

      await user.type(descriptionInput, 'Monthly Event');
      await user.click(monthOnlyCheckbox);
      await user.click(addButton);

      expect(screen.getByText('Monthly Event')).toBeInTheDocument();
    });
  });

  describe('Editing Events', () => {
    beforeEach(async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });
      
      await user.type(descriptionInput, 'Test Event');
      await user.click(addButton);
    });

    it('should enter edit mode when edit button is clicked', async () => {
      const editButton = screen.getByRole('button', { name: '' }).parentElement.querySelector('button');
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should populate form with event data when editing', async () => {
      const editButton = screen.getByRole('button', { name: '' }).parentElement.querySelector('button');
      await user.click(editButton);

      const descriptionInput = screen.getByLabelText(/Event Description/i);
      expect(descriptionInput.value).toBe('Test Event');
    });

    it('should update event when update button is clicked', async () => {
      const editButton = screen.getByRole('button', { name: '' }).parentElement.querySelector('button');
      await user.click(editButton);

      const descriptionInput = screen.getByLabelText(/Event Description/i);
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Updated Event');
      
      const updateButton = screen.getByRole('button', { name: /Update/i });
      await user.click(updateButton);

      expect(screen.getByText('Updated Event')).toBeInTheDocument();
      expect(screen.queryByText('Test Event')).not.toBeInTheDocument();
    });

    it('should cancel editing when cancel button is clicked', async () => {
      const editButton = screen.getByRole('button', { name: '' }).parentElement.querySelector('button');
      await user.click(editButton);

      const descriptionInput = screen.getByLabelText(/Event Description/i);
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Changed Event');
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(descriptionInput.value).toBe('');
    });
  });

  describe('Deleting Events', () => {
    beforeEach(async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });
      
      await user.type(descriptionInput, 'Event to Delete');
      await user.click(addButton);
    });

    it('should delete event when delete button is clicked and confirmed', async () => {
      window.confirm = vi.fn(() => true);
      
      const deleteButtons = document.querySelectorAll('button svg.lucide-trash2');
      const deleteButton = deleteButtons[0].parentElement;
      
      await user.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this event?');
      expect(screen.queryByText('Event to Delete')).not.toBeInTheDocument();
    });

    it('should not delete event when deletion is cancelled', async () => {
      window.confirm = vi.fn(() => false);
      
      const deleteButtons = document.querySelectorAll('button svg.lucide-trash2');
      const deleteButton = deleteButtons[0].parentElement;
      
      await user.click(deleteButton);

      expect(window.confirm).toHaveBeenCalled();
      expect(screen.getByText('Event to Delete')).toBeInTheDocument();
    });
  });

  describe('Language Toggle', () => {
    it('should toggle between English and Hungarian', async () => {
      render(<RelationshipTimeline />);
      
      const langButton = screen.getByRole('button', { name: /HU/i });
      await user.click(langButton);

      expect(screen.getByText('Kapcsolat Idővonal')).toBeInTheDocument();
      expect(screen.getByText('Esemény Hozzáadása')).toBeInTheDocument();
      
      const engButton = screen.getByRole('button', { name: /EN/i });
      await user.click(engButton);

      expect(screen.getByText('Relationship Timeline')).toBeInTheDocument();
      expect(screen.getByText('Add Event')).toBeInTheDocument();
    });

    it('should persist language preference in localStorage', async () => {
      render(<RelationshipTimeline />);
      
      const langButton = screen.getByRole('button', { name: /HU/i });
      await user.click(langButton);

      expect(localStorage.getItem('appLanguage')).toBe('hu');
    });
  });

  describe('Data Persistence', () => {
    it('should save events to localStorage', async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });
      
      await user.type(descriptionInput, 'Persistent Event');
      await user.click(addButton);

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
      
      expect(screen.getByText('Loaded Event')).toBeInTheDocument();
      expect(screen.getByText('+5')).toBeInTheDocument();
    });
  });

  describe('Import/Export Functionality', () => {
    beforeEach(async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });
      
      await user.type(descriptionInput, 'Export Test Event');
      await user.click(addButton);
    });

    it('should have export button', () => {
      expect(screen.getByRole('button', { name: /Export Data/i })).toBeInTheDocument();
    });

    it('should trigger download when export button is clicked', async () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const exportButton = screen.getByRole('button', { name: /Export Data/i });
      
      await user.click(exportButton);

      const link = createElementSpy.mock.results.find(
        result => result.value?.tagName === 'A'
      )?.value;
      
      expect(link).toBeDefined();
      expect(link.download).toMatch(/relationship-timeline-.*\.json/);
    });

    it('should import data from file', async () => {
      window.alert = vi.fn();
      
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

      const importInput = screen.getByLabelText(/Import Data/i);
      
      Object.defineProperty(importInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(importInput);

      await waitFor(() => {
        expect(screen.getByText('Imported Event')).toBeInTheDocument();
      });
      
      expect(window.alert).toHaveBeenCalledWith('Data imported successfully!');
    });

    it('should show error for invalid import file', async () => {
      window.alert = vi.fn();
      
      const file = new File(['invalid json'], 'test.json', {
        type: 'application/json',
      });

      const importInput = screen.getByLabelText(/Import Data/i);
      
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
    beforeEach(async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });
      
      await user.type(descriptionInput, 'JSON Test Event');
      await user.click(addButton);
    });

    it('should toggle JSON view', async () => {
      const viewJsonButton = screen.getByRole('button', { name: /View JSON/i });
      
      await user.click(viewJsonButton);
      expect(screen.getByText('JSON Data')).toBeInTheDocument();
      
      await user.click(viewJsonButton);
      expect(screen.queryByText('JSON Data')).not.toBeInTheDocument();
    });

    it('should copy JSON to clipboard', async () => {
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      const viewJsonButton = screen.getByRole('button', { name: /View JSON/i });
      await user.click(viewJsonButton);
      
      const copyButton = screen.getByRole('button', { name: /Copy JSON/i });
      await user.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  describe('Timeline Visualization', () => {
    it('should show timeline when events exist', async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });
      
      await user.type(descriptionInput, 'Chart Event');
      await user.click(addButton);

      expect(screen.getByText('Timeline')).toBeInTheDocument();
    });

    it('should toggle line style', async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });
      
      await user.type(descriptionInput, 'Style Test');
      await user.click(addButton);

      const styleButton = screen.getByRole('button', { name: /Line Style/i });
      expect(styleButton).toHaveTextContent('Curved');
      
      await user.click(styleButton);
      expect(styleButton).toHaveTextContent('Straight');
    });
  });

  describe('Score Display', () => {
    it('should display positive scores with + prefix', async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const scoreInput = screen.getByLabelText(/Satisfaction Score/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });

      await user.type(descriptionInput, 'Positive Event');
      fireEvent.change(scoreInput, { target: { value: '5' } });
      await user.click(addButton);

      expect(screen.getByText('+5')).toBeInTheDocument();
    });

    it('should display negative scores with - prefix', async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const scoreInput = screen.getByLabelText(/Satisfaction Score/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });

      await user.type(descriptionInput, 'Negative Event');
      fireEvent.change(scoreInput, { target: { value: '-3' } });
      await user.click(addButton);

      expect(screen.getByText('-3')).toBeInTheDocument();
    });

    it('should display zero scores without prefix', async () => {
      render(<RelationshipTimeline />);
      
      const descriptionInput = screen.getByLabelText(/Event Description/i);
      const scoreInput = screen.getByLabelText(/Satisfaction Score/i);
      const addButton = screen.getByRole('button', { name: /Add Event/i });

      await user.type(descriptionInput, 'Neutral Event');
      fireEvent.change(scoreInput, { target: { value: '0' } });
      await user.click(addButton);

      const scoreElements = screen.getAllByText('0');
      const eventScore = scoreElements.find(el => 
        el.closest('.font-medium') !== null
      );
      expect(eventScore).toBeInTheDocument();
    });
  });
});