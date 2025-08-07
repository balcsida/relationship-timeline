import { describe, it, expect, vi } from 'vitest';
import {
  getScoreColor,
  formatScore,
  sortEventsByDate,
  createEventObject,
  exportEventsToJSON,
  validateImportedData
} from './eventUtils';

describe('Event Utilities', () => {
  describe('getScoreColor', () => {
    it('should return green for very positive scores (> 4)', () => {
      expect(getScoreColor(5)).toBe('#10b981');
      expect(getScoreColor(8)).toBe('#10b981');
    });

    it('should return lime for positive scores (1-4)', () => {
      expect(getScoreColor(1)).toBe('#84cc16');
      expect(getScoreColor(4)).toBe('#84cc16');
    });

    it('should return gray for neutral score (0)', () => {
      expect(getScoreColor(0)).toBe('#6b7280');
    });

    it('should return amber for negative scores (-1 to -3)', () => {
      expect(getScoreColor(-1)).toBe('#f59e0b');
      expect(getScoreColor(-3)).toBe('#f59e0b');
    });

    it('should return red for very negative scores (<= -4)', () => {
      expect(getScoreColor(-4)).toBe('#ef4444');
      expect(getScoreColor(-8)).toBe('#ef4444');
    });
  });

  describe('formatScore', () => {
    it('should add + prefix for positive scores', () => {
      expect(formatScore(1)).toBe('+1');
      expect(formatScore(8)).toBe('+8');
    });

    it('should not add prefix for zero', () => {
      expect(formatScore(0)).toBe('0');
    });

    it('should keep negative sign for negative scores', () => {
      expect(formatScore(-1)).toBe('-1');
      expect(formatScore(-8)).toBe('-8');
    });
  });

  describe('sortEventsByDate', () => {
    it('should sort events in chronological order', () => {
      const events = [
        { date: '2024-03-01', description: 'March' },
        { date: '2024-01-01', description: 'January' },
        { date: '2024-02-01', description: 'February' }
      ];

      const sorted = sortEventsByDate(events);
      
      expect(sorted[0].description).toBe('January');
      expect(sorted[1].description).toBe('February');
      expect(sorted[2].description).toBe('March');
    });

    it('should handle same dates', () => {
      const events = [
        { date: '2024-01-01', description: 'Event 1' },
        { date: '2024-01-01', description: 'Event 2' }
      ];

      const sorted = sortEventsByDate(events);
      expect(sorted).toHaveLength(2);
    });

    it('should not modify original array', () => {
      const events = [
        { date: '2024-02-01', description: 'Feb' },
        { date: '2024-01-01', description: 'Jan' }
      ];
      
      const original = [...events];
      sortEventsByDate(events);
      
      expect(events).toEqual(original);
    });
  });

  describe('createEventObject', () => {
    it('should create new event with generated ID when not editing', () => {
      const currentEvent = {
        description: 'New Event',
        score: 5,
        date: '2024-01-15',
        monthOnly: false
      };

      const result = createEventObject(currentEvent, null, []);
      
      expect(result.id).toBeDefined();
      expect(result.description).toBe('New Event');
      expect(result.displayDate).toBe('2024-01-15');
    });

    it('should preserve ID when editing existing event', () => {
      const currentEvent = {
        description: 'Updated Event',
        score: 3,
        date: '2024-01-15',
        monthOnly: false
      };
      
      const existingEvents = [
        { id: 123, description: 'Original Event' }
      ];

      const result = createEventObject(currentEvent, 0, existingEvents);
      
      expect(result.id).toBe(123);
      expect(result.description).toBe('Updated Event');
    });

    it('should format month-only dates correctly', () => {
      const currentEvent = {
        description: 'Monthly Event',
        score: 0,
        date: '2024-01-15',
        monthOnly: true
      };

      const result = createEventObject(currentEvent, null, []);
      
      expect(result.displayDate).toBe('2024-01');
    });

    it('should format specific dates correctly', () => {
      const currentEvent = {
        description: 'Daily Event',
        score: 0,
        date: '2024-01-15',
        monthOnly: false
      };

      const result = createEventObject(currentEvent, null, []);
      
      expect(result.displayDate).toBe('2024-01-15');
    });
  });

  describe('exportEventsToJSON', () => {
    it('should create data URI and filename', () => {
      const events = [
        { id: 1, description: 'Test Event', score: 5 }
      ];

      const result = exportEventsToJSON(events);
      
      expect(result.dataUri).toContain('data:application/json');
      expect(result.filename).toMatch(/relationship-timeline-\d{4}-\d{2}-\d{2}\.json/);
    });

    it('should properly encode JSON data', () => {
      const events = [
        { id: 1, description: 'Test & Event', score: 5 }
      ];

      const result = exportEventsToJSON(events);
      
      expect(result.dataUri).toContain(encodeURIComponent('Test & Event'));
    });

    it('should format JSON with indentation', () => {
      const events = [{ id: 1, description: 'Test' }];
      const result = exportEventsToJSON(events);
      
      const jsonPart = result.dataUri.split(',')[1];
      const decodedJson = decodeURIComponent(jsonPart);
      
      expect(decodedJson).toContain('  '); // Check for indentation
    });
  });

  describe('validateImportedData', () => {
    it('should validate correct event data', () => {
      const validData = [
        {
          id: 1,
          description: 'Valid Event',
          score: 5,
          date: '2024-01-01',
          displayDate: '2024-01-01',
          monthOnly: false
        }
      ];

      expect(validateImportedData(validData)).toBe(true);
    });

    it('should reject non-array data', () => {
      expect(validateImportedData({})).toBe(false);
      expect(validateImportedData('string')).toBe(false);
      expect(validateImportedData(null)).toBe(false);
    });

    it('should reject events missing required fields', () => {
      const missingId = [{ description: 'Test', score: 5, date: '2024-01-01' }];
      const missingDescription = [{ id: 1, score: 5, date: '2024-01-01' }];
      const missingScore = [{ id: 1, description: 'Test', date: '2024-01-01' }];
      const missingDate = [{ id: 1, description: 'Test', score: 5 }];

      expect(validateImportedData(missingId)).toBe(false);
      expect(validateImportedData(missingDescription)).toBe(false);
      expect(validateImportedData(missingScore)).toBe(false);
      expect(validateImportedData(missingDate)).toBe(false);
    });

    it('should reject events with invalid score range', () => {
      const tooHigh = [{
        id: 1,
        description: 'Test',
        score: 9,
        date: '2024-01-01'
      }];
      
      const tooLow = [{
        id: 1,
        description: 'Test',
        score: -9,
        date: '2024-01-01'
      }];

      expect(validateImportedData(tooHigh)).toBe(false);
      expect(validateImportedData(tooLow)).toBe(false);
    });

    it('should reject events with non-numeric scores', () => {
      const stringScore = [{
        id: 1,
        description: 'Test',
        score: '5',
        date: '2024-01-01'
      }];

      expect(validateImportedData(stringScore)).toBe(false);
    });

    it('should accept valid score boundaries', () => {
      const minScore = [{
        id: 1,
        description: 'Test',
        score: -8,
        date: '2024-01-01'
      }];
      
      const maxScore = [{
        id: 2,
        description: 'Test',
        score: 8,
        date: '2024-01-01'
      }];

      expect(validateImportedData(minScore)).toBe(true);
      expect(validateImportedData(maxScore)).toBe(true);
    });
  });
});