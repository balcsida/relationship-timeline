import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sortEventsByDate } from '@/utils/eventUtils';
import { translations } from '@/i18n/translations';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [language, setLanguageState] = useState('en');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [lineType, setLineType] = useState('monotone');

  useEffect(() => {
    const savedEvents = localStorage.getItem('relationshipEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('relationshipEvents', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const addEvent = useCallback((event) => {
    setEvents((prev) => sortEventsByDate([...prev, { ...event, id: Date.now() }]));
  }, []);

  const updateEvent = useCallback((id, updatedEvent) => {
    setEvents((prev) =>
      sortEventsByDate(prev.map((e) => (e.id === id ? { ...updatedEvent, id } : e)))
    );
  }, []);

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEventId((prev) => (prev === id ? null : prev));
  }, []);

  const toggleSelectedEvent = useCallback((id) => {
    setSelectedEventId((prev) => (prev === id ? null : id));
  }, []);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
  }, []);

  const importEvents = useCallback((newEvents) => {
    setEvents(sortEventsByDate(newEvents));
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setSelectedEventId(null);
  }, []);

  const value = {
    events,
    language,
    selectedEventId,
    lineType,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleSelectedEvent,
    setLanguage,
    setLineType,
    importEvents,
    clearEvents,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}

export function useTranslation() {
  const { language } = useEvents();
  return translations[language];
}
