import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useEvents, useTranslation } from '@/context/EventContext';

const emptyForm = {
  description: '',
  score: 0,
  date: new Date().toISOString().split('T')[0],
  monthOnly: false,
};

export default function EventFormDialog({ open, onOpenChange, editingEvent }) {
  const { addEvent, updateEvent } = useEvents();
  const t = useTranslation();
  const [form, setForm] = useState(emptyForm);

  const isEditing = editingEvent != null;

  useEffect(() => {
    if (editingEvent) {
      setForm({
        description: editingEvent.description,
        score: editingEvent.score,
        date: editingEvent.date,
        monthOnly: editingEvent.monthOnly || false,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingEvent, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const displayDate = form.monthOnly ? form.date.substring(0, 7) : form.date;
    const eventData = {
      description: form.description,
      score: Number(form.score),
      date: form.date,
      displayDate,
      monthOnly: form.monthOnly,
    };

    if (isEditing) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t.editEvent : t.addEvent}</DialogTitle>
          <DialogDescription>{isEditing ? t.editEvent : t.addEvent}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">{t.eventDescription}</Label>
            <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t.descriptionPlaceholder} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">{t.satisfactionScore}</Label>
            <Input id="score" type="number" min={-8} max={8} value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">{t.date}</Label>
            <Input id="date" type={form.monthOnly ? "month" : "date"} value={form.monthOnly ? form.date.substring(0, 7) : form.date} onChange={(e) => { const value = e.target.value; setForm({ ...form, date: form.monthOnly ? value + '-01' : value }); }} required />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="monthOnly" checked={form.monthOnly} onCheckedChange={(checked) => setForm({ ...form, monthOnly: checked })} />
            <Label htmlFor="monthOnly" className="cursor-pointer">{t.monthOnly}</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
            <Button type="submit" variant="gradient">{isEditing ? t.update : t.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
