import { describe, it, expect } from 'bun:test';
import { render, screen } from './test/test-utils';
import App from './App';
import './test/setup.bun';

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