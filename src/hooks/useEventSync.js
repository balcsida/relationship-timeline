import { useRef, useCallback, useEffect } from 'react';
import { useEvents } from '@/context/EventContext';

export function useEventSync() {
  const { selectedEventId } = useEvents();
  const timelineRefs = useRef({});
  const tableRowRefs = useRef({});

  const registerTimelineRef = useCallback((id, el) => {
    if (el) {
      timelineRefs.current[id] = el;
    } else {
      delete timelineRefs.current[id];
    }
  }, []);

  const registerTableRowRef = useCallback((id, el) => {
    if (el) {
      tableRowRefs.current[id] = el;
    } else {
      delete tableRowRefs.current[id];
    }
  }, []);

  useEffect(() => {
    if (selectedEventId == null) return;

    const timelineEl = timelineRefs.current[selectedEventId];
    if (timelineEl) {
      timelineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const tableEl = tableRowRefs.current[selectedEventId];
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedEventId]);

  return {
    registerTimelineRef,
    registerTableRowRef,
  };
}
