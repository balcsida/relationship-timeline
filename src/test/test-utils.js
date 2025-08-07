import { render as rtlRender, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Re-export everything
export * from '@testing-library/react';
export { userEvent, fireEvent, waitFor };

// Custom render function
export function render(ui, options = {}) {
  return rtlRender(ui, options);
}

// Helper for getting elements by text with partial matching
export function getByTextContent(container, text) {
  const elements = [...container.querySelectorAll('*')];
  return elements.find(element => element.textContent?.includes(text));
}

// Helper for async operations
export async function waitForElement(fn, options = {}) {
  const { timeout = 3000 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = fn();
      if (result) return result;
    } catch (e) {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  throw new Error('Timed out waiting for element');
}