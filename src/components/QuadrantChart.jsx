import React from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Label, 
  Legend,
  ReferenceArea,
  Cell
} from 'recharts';
// Using Recharts' built-in Tooltip

const QuadrantChart = ({ data = [], currentPoint, onPointClick }) => {
  // Define quadrants with labels and descriptions
  const quadrants = [
    { 
      id: 'degenerative',
      x: [0, 2.5], 
      y: [0, 2.5], 
      fill: 'rgba(239, 68, 68, 0.05)', 
      color: 'rgba(239, 68, 68, 0.9)',
      label: 'Degenerative',
      description: 'Low Regenerative Capacity, Low Realized Regeneration',
      textPosition: { x: 1.25, y: 1.25 }
    },
    { 
      id: 'latent',
      x: [2.5, 5], 
      y: [0, 2.5], 
      fill: 'rgba(59, 130, 246, 0.05)', 
      color: 'rgba(59, 130, 246, 0.9)',
      label: 'Latent Potential',
      description: 'High Regenerative Capacity, Low Realized Regeneration',
      textPosition: { x: 3.75, y: 1.25 }
    },
    { 
      id: 'unsustainable',
      x: [0, 2.5], 
      y: [2.5, 5], 
      fill: 'rgba(245, 158, 11, 0.05)', 
      color: 'rgba(245, 158, 11, 0.9)',
      label: 'Unsustainable',
      description: 'Low Regenerative Capacity, High Realized Regeneration',
      textPosition: { x: 1.25, y: 3.75 }
    },
    { 
      id: 'thriving',
      x: [2.5, 5], 
      y: [2.5, 5], 
      fill: 'rgba(16, 185, 129, 0.05)', 
      color: 'rgba(16, 185, 129, 0.9)',
      label: 'Thriving System',
      description: 'High Regenerative Capacity, High Realized Regeneration',
      textPosition: { x: 3.75, y: 3.75 }
    },
  ];

  // Add current point to the data if provided
  const chartData = [...data];
  if (currentPoint) {
    chartData.push({ ...currentPoint, isCurrent: true });
  }

  // Custom dot component for better interactivity
  const renderDot = (props) => {
    const { cx, cy, payload, isCurrent } = props;
    if (isCurrent) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill="#ef4444" stroke="#b91c1c" strokeWidth={2} />
          <text 
            x={cx} 
            y={cy} 
            dy={4} 
            textAnchor="middle" 
            fill="white" 
            fontSize={10} 
            fontWeight="bold"
          >
            NOW
          </text>
        </g>
      );
    }
    
    return (
      <g>
        <circle 
          cx={cx} 
          cy={cy} 
          r={6} 
          fill="#3b82f6" 
          stroke="#1d4ed8" 
          strokeWidth={1}
          style={{ cursor: 'pointer' }}
          onClick={() => onPointClick && onPointClick(payload)}
        />
        {payload?.label && (
          <text 
            x={cx} 
            y={cy - 10} 
            textAnchor="middle" 
            fontSize={10} 
            fill="#4b5563"
          >
            {payload.label}
          </text>
        )}
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const isCurrent = data.isCurrent;
    const quadrant = getQuadrant(data);
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 max-w-[280px]">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              {data.label || (isCurrent ? 'Current State' : 'Snapshot')}
            </h4>
            {quadrant && (
              <div className="flex items-center mt-1">
                <span 
                  className="inline-block w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: quadrant.color }}
                />
                <span className="text-xs font-medium text-gray-600">{quadrant.label}</span>
              </div>
            )}
          </div>
          <div className="bg-gray-50 p-1.5 rounded">
            {isCurrent ? (
              <span className="text-xs font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded">CURRENT</span>
            ) : (
              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">SNAPSHOT</span>
            )}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Regenerative Potential</p>
              <p className="font-semibold text-gray-900">{data.y?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Extractive Pressure</p>
              <p className="font-semibold text-gray-900">{data.x?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
          
          {data.timestamp && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {new Date(data.timestamp).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get quadrant for a point
  const getQuadrant = (point) => {
    if (!point) return null;
    return quadrants.find(q => 
      point.x >= q.x[0] && point.x <= q.x[1] && 
      point.y >= q.y[0] && point.y <= q.y[1]
    );
  };

  const currentQuadrant = currentPoint ? getQuadrant(currentPoint) : null;

  const ticks = [0, 1, 2, 3, 4, 5];

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Regenerative Quadrant
        </h2>
        <p className="text-sm text-gray-500">
          Track your system's performance across key regenerative metrics
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          {/* X Axis */}
          <XAxis 
            type="number" 
            dataKey="x" 
            domain={[0, 5]}
            ticks={ticks}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
            axisLine={{ stroke: '#9ca3af' }}
          >
            <Label 
              value="Extractive Pressure (X + Fg + Ω)" 
              offset={5} 
              position="bottom"
              style={{ fontSize: 12 }}
            />
          </XAxis>
          
          {/* Y Axis */}
          <YAxis 
            type="number" 
            dataKey="y" 
            domain={[0, 5]}
            ticks={ticks}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
            axisLine={{ stroke: '#9ca3af' }}
          >
            <Label 
              value="Regenerative Potential (L×I×F×E)" 
              angle={-90} 
              position="left"
              style={{ textAnchor: 'middle', fontSize: 12 }}
            />
          </YAxis>
          
          {/* Reference lines */}
          <ReferenceLine 
            x={2.5} 
            stroke="#6b7280" 
            strokeWidth={1.5}
          />
          <ReferenceLine 
            y={2.5} 
            stroke="#6b7280" 
            strokeWidth={1.5}
          />
          
          {/* Quadrant backgrounds */}
          {quadrants.map((quadrant, index) => (
            <ReferenceArea
              key={index}
              x1={quadrant.x[0]}
              x2={quadrant.x[1]}
              y1={quadrant.y[0]}
              y2={quadrant.y[1]}
              fill={quadrant.fill}
              stroke={quadrant.color}
              strokeWidth={1.5}
            />
          ))}
          
          {/* Quadrant labels removed as requested */}
          
          {/* Data points */}
          <Scatter
            name="Snapshots"
            data={chartData.filter(d => !d.isCurrent)}
            shape={renderDot}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isCurrent ? '#ef4444' : '#3b82f6'}
              />
            ))}
          </Scatter>
          
          {/* Current point */}
          {currentPoint && (
            <Scatter
              name="Current State"
              data={[currentPoint]}
              shape={renderDot}
              isAnimationActive={false}
            />
          )}
          
          <ChartTooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px'
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
      
      <div className="mt-2 text-xs text-gray-400 text-center">
        <p>Hover over points for details • Click on snapshots to view details</p>
      </div>
    </div>
  )
};

export default QuadrantChart;
