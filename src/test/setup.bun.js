import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { beforeEach, afterEach, expect } from 'bun:test';

// Register Happy DOM globally
GlobalRegistrator.register();

// Mock window.matchMedia
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Clear localStorage and cleanup between tests
beforeEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});

afterEach(() => {
  // Clean up any mounted components
  document.body.innerHTML = '';
});

// Add custom matchers for DOM testing
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && document.body.contains(received);
    return {
      pass,
      message: () => pass 
        ? `expected element not to be in the document`
        : `expected element to be in the document`
    };
  },
  toHaveTextContent(received, expected) {
    const actualText = received?.textContent || '';
    const pass = actualText.includes(expected);
    return {
      pass,
      message: () => pass
        ? `expected element not to have text content "${expected}"`
        : `expected element to have text content "${expected}", but got "${actualText}"`
    };
  },
  toHaveAttribute(received, attr, value) {
    const actualValue = received?.getAttribute(attr);
    const pass = value === undefined ? received?.hasAttribute(attr) : actualValue === value;
    return {
      pass,
      message: () => pass
        ? `expected element not to have attribute "${attr}" with value "${value}"`
        : `expected element to have attribute "${attr}" with value "${value}", but got "${actualValue}"`
    };
  },
  toHaveClass(received, className) {
    const pass = received?.classList?.contains(className);
    return {
      pass,
      message: () => pass
        ? `expected element not to have class "${className}"`
        : `expected element to have class "${className}"`
    };
  }
});