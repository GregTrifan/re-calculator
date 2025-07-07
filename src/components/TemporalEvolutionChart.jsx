import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TemporalEvolutionChart = ({ data = [] }) => {
  // Ensure data is an array and has at least one element
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No temporal data available</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ aspectRatio: '1/1', maxWidth: '600px', margin: '0 auto' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          {/* X Axis - Time Points */}
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#9ca3af' }}
            axisLine={{ stroke: '#9ca3af' }}
            height={40}
            tickFormatter={(timestamp) => {
              if (!timestamp) return '';
              const date = new Date(timestamp);
              return date.toLocaleDateString('en-GB'); // This will format as DD/MM/YYYY
            }}
          />
          
          {/* Y Axis - Scores */}
          <YAxis 
            domain={[0, 5.5]} 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#9ca3af' }}
            axisLine={{ stroke: '#9ca3af' }}
            width={40}
          >
            <text x={-20} y={10} textAnchor="start" fill="#6b7280" fontSize={12}>
              Score
            </text>
          </YAxis>
          
          {/* Tooltip */}
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name) => [value.toFixed(2), name]}
            labelFormatter={(label) => `Time Point: ${label}`}
          />
          
          {/* Legend */}
          <Legend 
            verticalAlign="top"
            height={36}
            wrapperStyle={{
              paddingBottom: '10px'
            }}
          />
          
          {/* Regenerative Capacity Line */}
          <Line
            type="monotone"
            dataKey="reLog"
            name="Regenerative Capacity (Re)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6' }}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
          />
          
          {/* Realized Regeneration Line */}
          <Line
            type="monotone"
            dataKey="rxScaled"
            name="Realized Regeneration (Rx)"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4, fill: '#10b981' }}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            strokeDasharray="5 5"
          />
          
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TemporalEvolutionChart;
