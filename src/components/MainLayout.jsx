import { useState, lazy, Suspense } from 'react';
import AppHeader from '@/components/AppHeader';
import SatisfactionChart from '@/components/SatisfactionChart';
import EventTable from '@/components/EventTable';
import EventFormDialog from '@/components/EventFormDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import SettingsDialog from '@/components/SettingsDialog';
import PrintPreviewDialog from '@/components/PrintPreviewDialog';
import { useEvents, useTranslation } from '@/context/EventContext';
import { useEventSync } from '@/hooks/useEventSync';
import { getScoreColor } from '@/utils/eventUtils';

const PrintableTimelineChart = lazy(() => import('./PrintableTimelineChart'));

export default function MainLayout() {
  const { events, deleteEvent } = useEvents();
  const t = useTranslation();
  const { registerTableRowRef } = useEventSync();

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (event) => {
    setDeletingEvent(event);
  };

  const handleConfirmDelete = (id) => {
    deleteEvent(id);
    setDeletingEvent(null);
  };

  const chartData = events.map((event) => ({
    date: event.displayDate,
    satisfaction: event.score,
    description: event.description,
  }));

  return (
    <>
      {/* Print container - hidden on screen, visible on print */}
      <div className="print-container">
        <div className="print-header">
          <h1>{t.sessionTitle}</h1>
          <div className="print-info">
            <div className="print-info-item">
              <strong>{t.patientName}:</strong> <span data-field="patient">_______________</span>
            </div>
            <div className="print-info-item">
              <strong>{t.sessionDate}:</strong> <span data-field="session-date">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="print-info-item">
              <strong>{t.therapistName}:</strong> <span data-field="therapist">_______________</span>
            </div>
          </div>
          <div className="print-info">
            <div className="print-info-item">
              <strong>{t.periodCovered}:</strong>{' '}
              {events.length > 0
                ? `${events[0].displayDate} to ${events[events.length - 1].displayDate}`
                : 'N/A'}
            </div>
            <div className="print-info-item">
              <strong>{t.totalEvents}:</strong> {events.length}
            </div>
          </div>
        </div>

        {events.length > 0 && (
          <div className="print-chart">
            <Suspense fallback={<div>Loading chart...</div>}>
              <PrintableTimelineChart data={chartData} lineType="monotone" showLabels={true} />
            </Suspense>
          </div>
        )}

        <div className="print-summary">
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>{t.eventSummary}</h2>
          <table className="print-events-table">
            <thead>
              <tr>
                <th>{t.date}</th>
                <th>{t.eventDescription}</th>
                <th>{t.satisfactionLevel}</th>
                <th>{t.emotionalState}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.displayDate}</td>
                  <td>{event.description}</td>
                  <td>
                    <span className="satisfaction-badge" style={{ backgroundColor: getScoreColor(event.score) + '20', color: getScoreColor(event.score) }}>
                      {event.score > 0 ? '+' : ''}{event.score}
                    </span>
                  </td>
                  <td>
                    {event.score >= 6 ? 'Very Happy' :
                     event.score >= 3 ? 'Happy' :
                     event.score > 0 ? 'Slightly Happy' :
                     event.score === 0 ? 'Neutral' :
                     event.score > -3 ? 'Slightly Unhappy' :
                     event.score > -6 ? 'Unhappy' : 'Very Unhappy'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print-notes">
          <h3>{t.sessionNotes}</h3>
          <div data-field="notes"></div>
          <div className="print-notes-lines"></div>
          <div className="print-notes-lines"></div>
          <div className="print-notes-lines"></div>
        </div>
      </div>

      {/* Screen layout */}
      <div className="min-h-screen bg-background no-print">
        <AppHeader onAddEvent={handleAddEvent} onOpenSettings={() => setShowSettings(true)} />

        <main className="max-w-7xl mx-auto p-6 space-y-6">
          {events.length > 0 && <SatisfactionChart />}

          <EventTable
            registerTableRowRef={registerTableRowRef}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </main>

        <EventFormDialog open={showEventForm} onOpenChange={setShowEventForm} editingEvent={editingEvent} />
        <DeleteConfirmDialog open={deletingEvent != null} onOpenChange={(open) => !open && setDeletingEvent(null)} event={deletingEvent} onConfirm={handleConfirmDelete} />
        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} onOpenPrint={() => setShowPrintPreview(true)} />
        <PrintPreviewDialog open={showPrintPreview} onOpenChange={setShowPrintPreview} />
      </div>
    </>
  );
}
