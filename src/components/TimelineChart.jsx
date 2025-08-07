import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const TimelineChart = ({ data, lineType }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            domain={[-8, 8]} 
            ticks={[-8, -6, -4, -2, 0, 2, 4, 6, 8]}
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
          <ReferenceLine 
            y={0} 
            stroke="#9ca3af" 
            strokeDasharray="5 5" 
            strokeWidth={2}
          />
          <Line 
            type={lineType}
            dataKey="satisfaction" 
            stroke="#ec4899" 
            strokeWidth={3}
            dot={{ fill: '#ec4899', strokeWidth: 2, r: 6 }} 
            activeDot={{ r: 8 }}
            name="Satisfaction"
          />
        </LineChart>
      </ResponsiveContainer>
  );
};

export default TimelineChart;