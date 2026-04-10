import { useRef, useCallback, useEffect } from 'react';
import { useEvents } from '@/context/EventContext';

export function useEventSync() {
  const { selectedEventId } = useEvents();
  const tableRowRefs = useRef({});

  const registerTableRowRef = useCallback((id, el) => {
    if (el) {
      tableRowRefs.current[id] = el;
    } else {
      delete tableRowRefs.current[id];
    }
  }, []);

  useEffect(() => {
    if (selectedEventId == null) return;

    const tableEl = tableRowRefs.current[selectedEventId];
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedEventId]);

  return {
    registerTableRowRef,
  };
}
