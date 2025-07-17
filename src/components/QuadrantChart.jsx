import React, { useMemo } from 'react';
import { generateColorFromId } from '../utils/colorUtils';
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
  Cell,
  Line
} from 'recharts';
// Using Recharts' built-in Tooltip

const QuadrantChart = ({ snapshots = [], currentPoint, onPointClick }) => {
  // Modular forecasting function using vector extrapolation
  const calculateForecast = (snapshots) => {
    if (snapshots.length < 2) return null;
    
    // Get the last two snapshots sorted by timestamp
    const sortedSnapshots = snapshots
      .filter(snapshot => snapshot.timestamp)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (sortedSnapshots.length < 2) return null;
    
    const lastPoint = {
      x: sortedSnapshots[sortedSnapshots.length - 1].reLog || 0,
      y: sortedSnapshots[sortedSnapshots.length - 1].rxScaled || 0
    };
    
    const secondLastPoint = {
      x: sortedSnapshots[sortedSnapshots.length - 2].reLog || 0,
      y: sortedSnapshots[sortedSnapshots.length - 2].rxScaled || 0
    };
    
    // Calculate vector from second-last to last point
    const vector = {
      x: lastPoint.x - secondLastPoint.x,
      y: lastPoint.y - secondLastPoint.y
    };
    
    // Extrapolate to get forecast point
    const forecastPoint = {
      x: lastPoint.x + vector.x,
      y: lastPoint.y + vector.y,
      id: 'forecast',
      label: 'Forecast',
      isForecast: true,
      timestamp: null // No timestamp for forecast
    };
    
    // Ensure forecast stays within chart bounds
    forecastPoint.x = Math.max(0, Math.min(5.52, forecastPoint.x));
    forecastPoint.y = Math.max(0, Math.min(5.52, forecastPoint.y));
    
    // Calculate vector endpoint that extends to chart boundaries
    const calculateVectorEndpoint = (startPoint, vector) => {
      if (vector.x === 0 && vector.y === 0) return startPoint;
      
      // Calculate how far we can extend in each direction
      let tMax = Infinity;
      
      // Check X boundaries
      if (vector.x > 0) {
        tMax = Math.min(tMax, (5.52 - startPoint.x) / vector.x);
      } else if (vector.x < 0) {
        tMax = Math.min(tMax, (0 - startPoint.x) / vector.x);
      }
      
      // Check Y boundaries
      if (vector.y > 0) {
        tMax = Math.min(tMax, (5.52 - startPoint.y) / vector.y);
      } else if (vector.y < 0) {
        tMax = Math.min(tMax, (0 - startPoint.y) / vector.y);
      }
      
      // If tMax is still infinity or negative, return start point
      if (tMax === Infinity || tMax <= 0) return startPoint;
      
      return {
        x: startPoint.x + vector.x * tMax,
        y: startPoint.y + vector.y * tMax,
        id: 'vector-end',
        label: 'Forecast Vector',
        isVectorEnd: true
      };
    };
    
    const vectorEndpoint = calculateVectorEndpoint(forecastPoint, vector);
    
    return {
      point: forecastPoint,
      lastPoint: lastPoint,
      vectorEndpoint: vectorEndpoint,
      vector: vector
    };
  };

  // Calculate forecast
  const forecast = useMemo(() => calculateForecast(snapshots), [snapshots]);

  // Define quadrants with labels and descriptions
  const quadrants = [
    { 
      id: 'degenerative',
      x: [0, 2.751], 
      y: [0, 2.751], 
      fill: 'rgba(239, 68, 68, 0.05)', 
      color: 'rgba(239, 68, 68, 0.9)',
      label: 'Degenerative',
      description: 'Low Regenerative Capacity, Low Realized Regeneration',
      textPosition: { x: 1.3755, y: 1.3755 }
    },
    { 
      id: 'latent',
      x: [2.751, 5.52], 
      y: [0, 2.751], 
      fill: 'rgba(59, 130, 246, 0.05)', 
      color: 'rgba(59, 130, 246, 0.9)',
      label: 'Latent Potential',
      description: 'High Regenerative Capacity, Low Realized Regeneration',
      textPosition: { x: 4.1355, y: 1.3755 }
    },
    { 
      id: 'unsustainable',
      x: [0, 2.751], 
      y: [2.751, 5.52], 
      fill: 'rgba(245, 158, 11, 0.05)', 
      color: 'rgba(245, 158, 11, 0.9)',
      label: 'Unsustainable',
      description: 'Low Regenerative Capacity, High Realized Regeneration',
      textPosition: { x: 1.3755, y: 4.1355 }
    },
    { 
      id: 'thriving',
      x: [2.751, 5.52], 
      y: [2.751, 5.52], 
      fill: 'rgba(16, 185, 129, 0.05)', 
      color: 'rgba(16, 185, 129, 0.9)',
      label: 'Thriving System',
      description: 'High Regenerative Capacity, High Realized Regeneration',
      textPosition: { x: 4.1355, y: 4.1355 }
    },
  ];

  // Generate consistent colors for each snapshot
  const snapshotColors = useMemo(() => {
    const colors = {};
    snapshots.forEach(snapshot => {
      colors[snapshot.id] = generateColorFromId(snapshot.id);
    });
    return colors;
  }, [snapshots]);

  // Prepare sorted snapshots for line connections
  const sortedSnapshots = useMemo(() => {
    return snapshots
      .filter(snapshot => snapshot.timestamp)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(snapshot => ({
        x: snapshot.reLog || 0,
        y: snapshot.rxScaled || 0,
        timestamp: snapshot.timestamp
      }));
  }, [snapshots]);

  // Prepare chart data from snapshots and current point
  const chartData = useMemo(() => {
    console.log('Snapshots received:', snapshots);
    console.log('Current point:', currentPoint);
    
    // Map snapshots to chart data format
    const snapshotPoints = snapshots.map(snapshot => {
      const point = {
        ...snapshot,
        x: snapshot.reLog || 0,
        y: snapshot.rxScaled || 0,
        id: snapshot.id || `snap-${Math.random().toString(36).substr(2, 9)}`,
        label: snapshot.label || 'Snapshot',
        timestamp: snapshot.timestamp || new Date().toISOString(),
        isCurrent: false
      };
      console.log('Mapped snapshot point:', point);
      return point;
    });
    
    // Add current point if provided
    if (currentPoint) {
      const current = {
        ...currentPoint,
        x: currentPoint.x || 0,
        y: currentPoint.y || 0,
        id: 'current',
        label: 'Current',
        isCurrent: true
      };
      console.log('Current point:', current);
      snapshotPoints.push(current);
    }
    
    console.log('Final chart data:', snapshotPoints);
    return snapshotPoints;
  }, [snapshots, currentPoint]);

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // This will format as DD/MM/YYYY
  };

  // Custom dot component for better interactivity
  const renderDot = (props) => {
    const { cx, cy, payload, isCurrent, isForecast } = props;
    
    // Vector endpoint (star shape)
    if (payload?.isVectorEnd) {
      const starSize = 8;
      const starPoints = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5;
        const radius = i % 2 === 0 ? starSize : starSize / 2;
        const x = cx + Math.cos(angle - Math.PI / 2) * radius;
        const y = cy + Math.sin(angle - Math.PI / 2) * radius;
        starPoints.push(`${x},${y}`);
      }
      
      return (
        <g>
          <polygon
            points={starPoints.join(' ')}
            fill="#8b5cf6"
            stroke="#8b5cf6"
            strokeWidth={1}
            opacity={0.9}
          />
          <text 
            x={cx + 12} 
            y={cy + 3} 
            textAnchor="start" 
            fontSize={9} 
            fill="#8b5cf6"
            fontWeight="bold"
          >
            Vector End
          </text>
        </g>
      );
    }
    
    // Forecast point (purple with dashed border)
    if (isForecast || payload?.isForecast) {
      return (
        <g>
          <circle 
            cx={cx} 
            cy={cy} 
            r={6} 
            fill="#8b5cf6"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="3 3"
            opacity={0.8}
          />
          <text 
            x={cx + 12} 
            y={cy + 3} 
            textAnchor="start" 
            fontSize={10} 
            fill="#8b5cf6"
            fontWeight="bold"
          >
            Forecast
          </text>
        </g>
      );
    }
    
    // Current point (black with NOW label)
    if (isCurrent) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill="#000000" stroke="#000000" strokeWidth={2} />
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
    
    // Snapshot points with unique colors
    const pointColor = snapshotColors[payload.id] || '#3b82f6';
    const strokeColor = `#${Math.min(parseInt(pointColor.slice(1), 16) - 0x222222).toString(16).padStart(6, '0')}`;
    
    return (
      <g>
        <circle 
          cx={cx} 
          cy={cy} 
          r={6} 
          fill={pointColor}
          stroke={strokeColor}
          strokeWidth={1}
          style={{ cursor: 'pointer' }}
          onClick={() => onPointClick && onPointClick(payload)}
        />
        {payload?.timestamp && (
          <text 
            x={cx + 12} 
            y={cy + 3} 
            textAnchor="start" 
            fontSize={10} 
            fill="#4b5563"
          >
            {formatDate(payload.timestamp)}
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
    const isForecast = data.isForecast;
    const quadrant = getQuadrant(data);
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 max-w-[280px]">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              {data.label || (isCurrent ? 'Current State' : isForecast ? 'Forecasted Point' : 'Snapshot')}
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
            ) : isForecast ? (
              <span className="text-xs font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded">FORECAST</span>
            ) : (
              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">SNAPSHOT</span>
            )}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Regenerative Capacity</p>
              <p className="font-semibold text-gray-900">{data.y?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Realized Regeneration Index</p>
              <p className="font-semibold text-gray-900">{data.x?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
          
          {isForecast && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-purple-600 italic">
                Projected based on trend from last two snapshots
              </p>
            </div>
          )}
          
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

  //const currentQuadrant = currentPoint ? getQuadrant(currentPoint) : null;

  const ticks = [0, 1, 2, 2.751, 3, 4, 5, 5.52];

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
      
      <div className="w-full" style={{ paddingBottom: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          {/* X Axis */}
          <XAxis 
            type="number" 
            dataKey="x" 
            domain={[0, 5.52]}
            ticks={ticks}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
            axisLine={{ stroke: '#9ca3af' }}
          >
            <Label 
              value="Re (Regenerative Capacity)" 
              offset={5} 
              position="bottom"
              style={{ fontSize: 12 }}
            />
          </XAxis>
          
          {/* Y Axis */}
          <YAxis 
            type="number" 
            dataKey="y" 
            domain={[0, 5.52]}
            ticks={ticks}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#9ca3af' }}
            axisLine={{ stroke: '#9ca3af' }}
          >
            <Label 
              value="Rx (Realized Regenerative Output)" 
              angle={-90} 
              position="left"
              style={{ textAnchor: 'middle', fontSize: 12 }}
            />
          </YAxis>
          
          {/* Reference Lines */}
          <ReferenceLine x={2.751} stroke="#6b7280" strokeDasharray="3 3" strokeWidth={1.5}>
            <Label value="2.75" position="insideBottom" offset={15} fill="#6b7280" fontSize={12} />
          </ReferenceLine>
          <ReferenceLine y={2.751} stroke="#6b7280" strokeDasharray="3 3" strokeWidth={1.5}>
            <Label value="2.75" position="insideLeft" offset={10} fill="#6b7280" fontSize={12} />
          </ReferenceLine>
          
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
          
          {/* Forecast line from last snapshot to forecast point */}
          {forecast && (
            <Line
              type="linear"
              dataKey="y"
              data={[forecast.lastPoint, forecast.point]}
               stroke="#8b5cf6"
              strokeWidth={1.5}
              strokeDasharray="2 4"
              dot={false}
              connectNulls={false}
              opacity={0.7}
            />
          )}
          
          {/* Forecast vector line from forecast point to boundary */}
          {forecast && forecast.vectorEndpoint && (
            <Line
              type="linear"
              dataKey="y"
              data={[forecast.point, forecast.vectorEndpoint]}
              stroke="#8b5cf6"
              strokeWidth={1.5}
              strokeDasharray="2 4"
              dot={false}
              connectNulls={false}
              opacity={0.7}
            />
          )}
          
          {/* Vector endpoint (star) */}
          {forecast && forecast.vectorEndpoint && (
            <Scatter
              name="Forecast Vector"
              data={[forecast.vectorEndpoint]}
              shape={renderDot}
              isAnimationActive={false}
            />
          )}
          
          {/* Connection lines between snapshots */}
          {sortedSnapshots.length > 1 && (
            <Line
              type="linear"
              dataKey="y"
              data={sortedSnapshots}
              stroke="#9ca3af"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          )}
          
          {/* Data points - snapshots */}
          {snapshots.length > 0 && (
            <Scatter
              name="Snapshots"
              data={chartData.filter(d => !d.isCurrent)}
              shape={renderDot}
            >
              {chartData
                .filter(entry => !entry.isCurrent)
                .map((entry, index) => (
                  <Cell
                    key={`cell-${entry.id || index}`}
                    fill={snapshotColors[entry.id] || '#3b82f6'}
                  />
                ))}
            </Scatter>
          )}
          
          {/* Current point */}
          {currentPoint && (
            <Scatter
              name="Current State"
              data={[{
                ...currentPoint,
                x: currentPoint.x || 0,
                y: currentPoint.y || 0,
                isCurrent: true
              }]}
              shape={renderDot}
              isAnimationActive={false}
            />
          )}
          
          <ChartTooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
        </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400 text-center">
        <p>Hover over points for details • Click on snapshots to view details{forecast ? ' • Purple point shows trend forecast' : ''}</p>
      </div>
    </div>
  )
};

export default QuadrantChart;
