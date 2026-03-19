import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, LabelList, Cell } from 'recharts';

const PrintableTimelineChart = ({ data, lineType, showLabels = false }) => {
  const renderCustomLabel = (props) => {
    const { x, y, index } = props;
    const event = data[index];
    if (!event || !showLabels) return null;

    const isPositive = event.satisfaction > 0;
    const isNegative = event.satisfaction < 0;
    const yOffset = isPositive ? -25 : 25;
    
    return (
      <g>
        <foreignObject x={x - 60} y={y + yOffset} width={120} height={50}>
          <div className={`event-label ${
            isPositive ? 'event-label-positive' : 
            isNegative ? 'event-label-negative' : 
            'event-label-neutral'
          }`}>
            <div style={{ fontSize: '9px', fontWeight: 'bold' }}>
              {event.date}
            </div>
            <div style={{ fontSize: '8px', marginTop: '2px' }}>
              {event.description}
            </div>
            <div style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '2px' }}>
              Score: {event.satisfaction > 0 ? '+' : ''}{event.satisfaction}
            </div>
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={showLabels ? 500 : 400}>
      <LineChart
        data={data}
        margin={{ 
          top: showLabels ? 60 : 20, 
          right: 30, 
          left: 20, 
          bottom: showLabels ? 60 : 40 
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 11 }}
          stroke="#6b7280"
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          domain={[-8, 8]} 
          ticks={[-8, -6, -4, -2, 0, 2, 4, 6, 8]}
          tick={{ fontSize: 11 }}
          stroke="#6b7280"
          label={{ 
            value: 'Satisfaction Level', 
            angle: -90, 
            position: 'insideLeft',
            style: { fontSize: 12 }
          }}
        />
        {!showLabels && (
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}
          />
        )}
        {!showLabels && <Legend />}
        <ReferenceLine 
          y={0} 
          stroke="#9ca3af" 
          strokeDasharray="5 5" 
          strokeWidth={2}
          label={{ value: "Neutral", position: "right", style: { fontSize: 10 } }}
        />
        <ReferenceLine 
          y={4} 
          stroke="#10b981" 
          strokeDasharray="3 3" 
          strokeWidth={1}
          opacity={0.5}
          label={{ value: "Happy", position: "right", style: { fontSize: 10 } }}
        />
        <ReferenceLine 
          y={-4} 
          stroke="#ef4444" 
          strokeDasharray="3 3" 
          strokeWidth={1}
          opacity={0.5}
          label={{ value: "Unhappy", position: "right", style: { fontSize: 10 } }}
        />
        <Line 
          type={lineType}
          dataKey="satisfaction" 
          stroke="#ec4899" 
          strokeWidth={showLabels ? 2 : 3}
          dot={{ fill: '#ec4899', strokeWidth: 2, r: showLabels ? 8 : 6 }} 
          activeDot={{ r: 8 }}
          name="Satisfaction"
          label={showLabels ? renderCustomLabel : false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PrintableTimelineChart;