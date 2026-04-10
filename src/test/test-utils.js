import { render as rtlRender, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventProvider } from '@/context/EventContext';

export * from '@testing-library/react';
export { userEvent, fireEvent, waitFor };

export function render(ui, options = {}) {
  const { wrapper: Wrapper, ...rest } = options;

  function AllProviders({ children }) {
    if (Wrapper) {
      return (
        <EventProvider>
          <Wrapper>{children}</Wrapper>
        </EventProvider>
      );
    }
    return <EventProvider>{children}</EventProvider>;
  }

  return rtlRender(ui, { wrapper: AllProviders, ...rest });
}

export function renderRaw(ui, options = {}) {
  return rtlRender(ui, options);
}

export function getByTextContent(container, text) {
  const elements = [...container.querySelectorAll('*')];
  return elements.find(element => element.textContent?.includes(text));
}

export async function waitForElement(fn, options = {}) {
  const { timeout = 3000 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = fn();
      if (result) return result;
    } catch { /* retry */ }
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  throw new Error('Timed out waiting for element');
}
