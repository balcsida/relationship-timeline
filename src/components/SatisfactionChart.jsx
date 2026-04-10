import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useEvents, useTranslation } from '@/context/EventContext';
import { getScoreColor } from '@/utils/eventUtils';

function CustomDot({ cx, cy, payload, selectedEventId, onDotClick }) {
  const isSelected = payload.id === selectedEventId;
  const color = getScoreColor(payload.score);

  return (
    <g onClick={() => onDotClick(payload.id)} className="cursor-pointer">
      {isSelected && (
        <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.2} />
      )}
      <circle
        cx={cx} cy={cy}
        r={isSelected ? 8 : 6}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
}

export default function SatisfactionChart() {
  const { events, lineType, selectedEventId, toggleSelectedEvent } = useEvents();
  const t = useTranslation();

  const chartData = events.map((event) => ({
    date: event.displayDate,
    satisfaction: event.score,
    score: event.score,
    id: event.id,
    description: event.description,
  }));

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground">{t.satisfactionOverTime}</h2>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            stroke="var(--color-border)"
          />
          <YAxis
            domain={[-8, 8]}
            ticks={[-8, -6, -4, -2, 0, 2, 4, 6, 8]}
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            stroke="var(--color-border)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.75rem',
              fontSize: '13px',
            }}
          />
          <ReferenceLine
            y={0}
            stroke="var(--color-muted-foreground)"
            strokeDasharray="5 5"
            strokeWidth={1}
          />
          <Line
            type={lineType}
            dataKey="satisfaction"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            dot={<CustomDot selectedEventId={selectedEventId} onDotClick={toggleSelectedEvent} />}
            activeDot={false}
            name={t.satisfactionLevel}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
