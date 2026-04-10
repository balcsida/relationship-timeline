import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useEvents, useTranslation } from '@/context/EventContext';
import { getScoreColor, formatScore } from '@/utils/eventUtils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function EventTable({ registerTableRowRef, onEditEvent, onDeleteEvent }) {
  const { events, selectedEventId, toggleSelectedEvent } = useEvents();
  const t = useTranslation();

  if (events.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex-1">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">{t.events}</h2>
        <p className="text-sm text-muted-foreground text-center py-8">{t.noEvents}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex-1">
      <h2 className="text-sm font-semibold text-muted-foreground mb-4">{t.events}</h2>
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">{t.date}</TableHead>
              <TableHead className="text-xs">{t.eventDescription}</TableHead>
              <TableHead className="text-xs text-right">{t.satisfactionLevel}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              const isSelected = event.id === selectedEventId;
              const color = getScoreColor(event.score);
              return (
                <TableRow
                  key={event.id}
                  ref={(el) => registerTableRowRef(event.id, el)}
                  onClick={() => toggleSelectedEvent(event.id)}
                  className={cn("cursor-pointer", isSelected && "bg-primary/5")}
                  data-state={isSelected ? "selected" : undefined}
                >
                  <TableCell className="text-sm text-muted-foreground">{event.displayDate}</TableCell>
                  <TableCell className="text-sm text-foreground">{event.description}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-semibold" style={{ color }}>{formatScore(event.score)}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditEvent(event)}>
                          <Edit2 size={14} />
                          {t.edit}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => onDeleteEvent(event)}>
                          <Trash2 size={14} />
                          {t.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
