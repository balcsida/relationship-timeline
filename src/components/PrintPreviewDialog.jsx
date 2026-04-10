import { useState, lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEvents, useTranslation } from '@/context/EventContext';
import { getScoreColor, formatScore } from '@/utils/eventUtils';

const PrintableTimelineChart = lazy(() => import('./PrintableTimelineChart'));

export default function PrintPreviewDialog({ open, onOpenChange }) {
  const { events } = useEvents();
  const t = useTranslation();
  const [patientName, setPatientName] = useState('');
  const [therapistName, setTherapistName] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionNotes, setSessionNotes] = useState('');

  const chartData = events.map((event) => ({
    date: event.displayDate,
    satisfaction: event.score,
    description: event.description,
  }));

  const handlePrint = () => {
    const container = document.querySelector('.print-container');
    if (container) {
      const patientEl = container.querySelector('[data-field="patient"]');
      const therapistEl = container.querySelector('[data-field="therapist"]');
      const dateEl = container.querySelector('[data-field="session-date"]');
      const notesEl = container.querySelector('[data-field="notes"]');
      if (patientEl) patientEl.textContent = patientName || '_______________';
      if (therapistEl) therapistEl.textContent = therapistName || '_______________';
      if (dateEl) dateEl.textContent = sessionDate;
      if (notesEl) notesEl.textContent = sessionNotes || '';
    }
    onOpenChange(false);
    setTimeout(() => window.print(), 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.printTimeline}</DialogTitle>
          <DialogDescription>{t.printTimeline}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">{t.patientName}</Label>
              <Input id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="therapistName">{t.therapistName}</Label>
              <Input id="therapistName" value={therapistName} onChange={(e) => setTherapistName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionDate">{t.sessionDate}</Label>
            <Input id="sessionDate" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
          </div>
          {events.length > 0 && (
            <div className="border border-border rounded-lg p-3">
              <Suspense fallback={<div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div>}>
                <PrintableTimelineChart data={chartData} lineType="monotone" showLabels={false} />
              </Suspense>
            </div>
          )}
          {events.length > 0 && (
            <div className="border border-border rounded-lg p-3 text-sm">
              <h3 className="font-medium mb-2">{t.eventSummary}</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1 pr-2">{t.date}</th>
                    <th className="text-left py-1 pr-2">{t.eventDescription}</th>
                    <th className="text-right py-1">{t.satisfactionLevel}</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-border/50">
                      <td className="py-1 pr-2 text-muted-foreground">{event.displayDate}</td>
                      <td className="py-1 pr-2">{event.description}</td>
                      <td className="py-1 text-right font-medium" style={{ color: getScoreColor(event.score) }}>{formatScore(event.score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="sessionNotes">{t.sessionNotes}</Label>
            <Textarea id="sessionNotes" rows={4} value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
          <Button variant="gradient" onClick={handlePrint}>{t.print}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
