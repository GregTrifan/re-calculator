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

const QuadrantChart = ({ data = [], currentPoint, onPointClick }) => {
  // Define quadrants with labels and descriptions
  const quadrants = [
    { 
      id: 'degenerative',
      x: [0, 5], 
      y: [0, 5], 
      fill: 'rgba(239, 68, 68, 0.1)', 
      color: 'rgba(239, 68, 68, 0.8)',
      label: 'Degenerative',
      description: 'High extractive pressure, low regenerative potential'
    },
    { 
      id: 'emerging',
      x: [5, 10], 
      y: [0, 5], 
      fill: 'rgba(59, 130, 246, 0.1)', 
      color: 'rgba(59, 130, 246, 0.8)',
      label: 'Emerging',
      description: 'High extractive pressure, high regenerative potential'
    },
    { 
      id: 'regenerative',
      x: [0, 5], 
      y: [5, 10], 
      fill: 'rgba(16, 185, 129, 0.1)', 
      color: 'rgba(16, 185, 129, 0.8)',
      label: 'Regenerative',
      description: 'Low extractive pressure, high regenerative potential'
    },
    { 
      id: 'transformative',
      x: [5, 10], 
      y: [5, 10], 
      fill: 'rgba(245, 158, 11, 0.1)', 
      color: 'rgba(245, 158, 11, 0.8)',
      label: 'Transformative',
      description: 'Low extractive pressure, high regenerative potential with systemic impact'
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
    
    return (
      <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
        <p className="font-semibold">{data.label || (isCurrent ? 'Current State' : 'Snapshot')}</p>
        <p className="text-sm">
          <span className="font-medium">Re:</span> {data.reLog?.toFixed(2) || 'N/A'}
          <span className="mx-2">•</span>
          <span className="font-medium">Rx:</span> {data.rxScaled?.toFixed(2) || 'N/A'}
        </p>
        {data.timestamp && (
          <p className="text-xs text-gray-500 mt-1">
            {new Date(data.timestamp).toLocaleString()}
          </p>
        )}
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Regenerative Quadrant Analysis</h3>
        {currentQuadrant && (
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: currentQuadrant.color }}
            />
            <span className="text-sm font-medium">{currentQuadrant.label} System</span>
          </div>
        )}
      </div>
      
      {currentQuadrant && (
        <p className="text-sm text-gray-600 mb-4">
          {currentQuadrant.description}
        </p>
      )}
      
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 10,
              right: 20,
              bottom: 30,
              left: 20,
            }}
            onClick={(e) => {
              if (e && e.chartX && e.chartY) {
                // Handle click on chart background if needed
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            
            {/* X Axis */}
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Extractive Pressure" 
              domain={[0, 10]}
              tickCount={6}
              tick={{ fontSize: 12 }}
            >
              <Label 
                value="Extractive Pressure (X + Fg + Ω)" 
                offset={-15} 
                position="insideBottom" 
                style={{ textAnchor: 'middle' }}
              />
            </XAxis>
            
            {/* Y Axis */}
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Regenerative Potential" 
              domain={[0, 10]}
              tickCount={6}
              tick={{ fontSize: 12 }}
            >
              <Label 
                value="Regenerative Potential (L × I × F × E)" 
                angle={-90} 
                position="insideLeft" 
                style={{ textAnchor: 'middle' }}
              />
            </YAxis>
            
            {/* Quadrant backgrounds */}
            {quadrants.map((quad) => (
              <ReferenceArea
                key={quad.id}
                x1={quad.x[0]}
                x2={quad.x[1]}
                y1={quad.y[0]}
                y2={quad.y[1]}
                fill={quad.fill}
                stroke="none"
              />
            ))}
            
            {/* Reference lines for quadrants */}
            <ReferenceLine 
              x={5} 
              stroke="#9ca3af" 
              strokeDasharray="3 3" 
              strokeWidth={1}
            />
            <ReferenceLine 
              y={5} 
              stroke="#9ca3af" 
              strokeDasharray="3 3" 
              strokeWidth={1}
            />
            
            {/* Data points */}
            <Scatter
              name="Snapshots"
              data={chartData.filter(d => !d.isCurrent)}
              shape={(props) => renderDot({ ...props, isCurrent: false })}
              isAnimationActive={false}
            >
              {chartData.filter(d => !d.isCurrent).map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  cursor="pointer"
                  onClick={() => onPointClick && onPointClick(entry)}
                />
              ))}
            </Scatter>
            
            {/* Current point */}
            {currentPoint && (
              <Scatter
                name="Current State"
                data={[currentPoint]}
                shape={(props) => renderDot({ ...props, isCurrent: true })}
                isAnimationActive={false}
              />
            )}
            
            <ChartTooltip 
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: '3 3' }}
            />
            
            <Legend 
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      {/* Quadrant legend */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {quadrants.map((quad) => (
          <div 
            key={quad.id}
            className={`p-3 rounded-md border ${
              currentQuadrant?.id === quad.id 
                ? 'ring-2 ring-offset-2 ring-opacity-50' 
                : 'border-gray-200'
            }`}
            style={{
              backgroundColor: quad.fill,
              borderColor: currentQuadrant?.id === quad.id ? quad.color : 'transparent',
              boxShadow: currentQuadrant?.id === quad.id 
                ? `0 0 0 2px ${quad.color}40` 
                : 'none'
            }}
          >
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: quad.color }}
              />
              <h4 className="font-medium" style={{ color: quad.color }}>
                {quad.label}
              </h4>
            </div>
            <p className="text-xs mt-1 text-gray-600">
              {quad.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuadrantChart;
