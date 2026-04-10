import { describe, test, expect } from 'bun:test';
import { render, fireEvent } from '@/test/test-utils';
import App from './App';

describe('App', () => {
  test('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  test('renders the app header with title', () => {
    const { container } = render(<App />);
    const title = container.querySelector('h1');
    expect(title).toHaveTextContent('Relationship Timeline');
  });

  test('shows empty state when no events exist', () => {
    const { container } = render(<App />);
    expect(container.textContent).toContain('No events yet');
  });

  test('loads events from localStorage', () => {
    const events = [
      { id: 1, description: 'Test event', score: 5, date: '2024-01-15', displayDate: '2024-01-15', monthOnly: false }
    ];
    localStorage.setItem('relationshipEvents', JSON.stringify(events));
    const { container } = render(<App />);
    expect(container.textContent).toContain('Test event');
  });

  test('loads language from localStorage', () => {
    localStorage.setItem('appLanguage', 'hu');
    const { container } = render(<App />);
    expect(container.textContent).toContain('Kapcsolat Idővonal');
  });

  test('toggles language between EN and HU', () => {
    const { container } = render(<App />);
    const langButton = [...container.querySelectorAll('button')].find(b => b.textContent.includes('HU'));
    expect(langButton).toBeTruthy();
    fireEvent.click(langButton);
    expect(container.textContent).toContain('Kapcsolat Idővonal');
  });
});
