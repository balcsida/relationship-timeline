export const getScoreColor = (score) => {
  if (score > 4) return '#10b981';
  if (score > 0) return '#84cc16';
  if (score === 0) return '#6b7280';
  if (score > -4) return '#f59e0b';
  return '#ef4444';
};

export const formatScore = (score) => {
  return score > 0 ? `+${score}` : score.toString();
};

export const sortEventsByDate = (events) => {
  return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const createEventObject = (currentEvent, editingIndex, existingEvents) => {
  return {
    ...currentEvent,
    id: editingIndex !== null ? existingEvents[editingIndex].id : Date.now(),
    displayDate: currentEvent.monthOnly 
      ? currentEvent.date.substring(0, 7)
      : currentEvent.date
  };
};

export const exportEventsToJSON = (events) => {
  const dataStr = JSON.stringify(events, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = `relationship-timeline-${new Date().toISOString().split('T')[0]}.json`;
  
  return {
    dataUri,
    filename: exportFileDefaultName
  };
};

export const validateImportedData = (data) => {
  if (!Array.isArray(data)) {
    return false;
  }
  
  return data.every(event => 
    event.hasOwnProperty('id') &&
    event.hasOwnProperty('description') &&
    event.hasOwnProperty('score') &&
    event.hasOwnProperty('date') &&
    typeof event.score === 'number' &&
    event.score >= -8 &&
    event.score <= 8
  );
};