import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('should render RelationshipTimeline component', () => {
    render(<App />);
    expect(screen.getByText('Relationship Timeline')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeDefined();
  });
});