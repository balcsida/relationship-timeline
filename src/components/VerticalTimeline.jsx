import { useEvents, useTranslation } from '@/context/EventContext';
import { getScoreColor, formatScore } from '@/utils/eventUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function VerticalTimeline({ registerTimelineRef }) {
  const { events, selectedEventId, toggleSelectedEvent } = useEvents();
  const t = useTranslation();

  if (events.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex-1">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">{t.timeline}</h2>
        <p className="text-sm text-muted-foreground text-center py-8">{t.noEvents}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex-1">
      <h2 className="text-sm font-semibold text-muted-foreground mb-4">{t.timeline}</h2>
      <ScrollArea className="h-[400px]">
        <div className="relative pl-7">
          <div
            className="absolute left-[7px] top-0 bottom-0 w-0.5"
            style={{ background: 'linear-gradient(to bottom, var(--color-primary), var(--color-accent))' }}
          />
          {events.map((event) => {
            const isSelected = event.id === selectedEventId;
            const color = getScoreColor(event.score);
            return (
              <div
                key={event.id}
                ref={(el) => registerTimelineRef(event.id, el)}
                onClick={() => toggleSelectedEvent(event.id)}
                className={cn(
                  "relative mb-6 last:mb-0 cursor-pointer rounded-lg p-2 -ml-2 transition-all duration-200",
                  isSelected && "bg-primary/5 ring-1 ring-primary/20"
                )}
              >
                <div
                  className={cn(
                    "absolute -left-[13px] top-3 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-transform duration-200",
                    isSelected && "scale-125"
                  )}
                  style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${color}40` }}
                />
                <div className="text-xs text-muted-foreground mb-0.5">{event.displayDate}</div>
                <div className="text-sm font-medium text-foreground">{event.description}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color }}>
                  {formatScore(event.score)}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
