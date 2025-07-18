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
  // Modular forecasting function using Re/Rx formula simulation
  const calculateForecast = (snapshots) => {
    if (snapshots.length < 1) return null;
    
    // Get the latest snapshot sorted by timestamp
    const sortedSnapshots = snapshots
      .filter(snapshot => snapshot.timestamp)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (sortedSnapshots.length < 1) return null;
    
    const latestSnapshot = sortedSnapshots[sortedSnapshots.length - 1];
    
    // Extract current metrics from the latest snapshot
    const currentMetrics = latestSnapshot.metrics || {
      L: 5, I: 5, F: 5, E: 5, X: 5, Fg: 5, Omega: 5
    };
    
    const currentRxIndicators = latestSnapshot.rxIndicators || [];
    
    // Simulate next period metrics with growth rates
    // Regenerative variables (L, I, F, E) increase by 5%
    // Entropic variables (X, Fg, Omega) increase by 2%
    const forecastMetrics = {
      L: Math.min(10, currentMetrics.L * 1.05),
      I: Math.min(10, currentMetrics.I * 1.05),
      F: Math.min(10, currentMetrics.F * 1.05),
      E: Math.min(10, currentMetrics.E * 1.05),
      X: Math.min(10, currentMetrics.X * 1.02),
      Fg: Math.min(10, currentMetrics.Fg * 1.02),
      Omega: Math.min(10, currentMetrics.Omega * 1.02)
    };
    
    // Calculate Re(t+1) using the ReRx formula
    const numerator = forecastMetrics.L * forecastMetrics.I * forecastMetrics.F * forecastMetrics.E;
    const denominator = forecastMetrics.X + forecastMetrics.Fg + forecastMetrics.Omega;
    const reRaw = denominator !== 0 ? numerator / denominator : Infinity;
    const reLog = Math.log10(reRaw + 1);
    
    // Simulate Rx(t+1) as 98% of current Rx (configurable decay)
    const currentRx = latestSnapshot.rxScaled || 0;
    const rxDecayRate = 0.98; // Configurable for scenario toggling
    const forecastRx = currentRx * rxDecayRate;
    
    // Create forecast point
    const forecastPoint = {
      x: Math.max(0, Math.min(5.52, reLog)),
      y: Math.max(0, Math.min(5.52, forecastRx)),
      id: 'forecast',
      label: 'Re/Rx Forecast',
      isForecast: true,
      timestamp: null,
      metrics: forecastMetrics,
      reLog: reLog,
      rxScaled: forecastRx
    };
    
    const lastPoint = {
      x: latestSnapshot.reLog || 0,
      y: latestSnapshot.rxScaled || 0
    };
    
    // Calculate vector from last point to forecast point
    const vector = {
      x: forecastPoint.x - lastPoint.x,
      y: forecastPoint.y - lastPoint.y
    };
    
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
            Forecast Vector
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
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">
            {data.isForecast ? 'Forecast Vector' : 
             data.isVectorEnd ? 'Forecast Vector Endpoint' :
             data.isCurrent ? 'Current State' : 
             data.label || 'Snapshot'}
          </p>
          {data.timestamp && (
            <p className="text-sm text-gray-600">
              Date: {formatDate(data.timestamp)}
            </p>
          )}
          <p className="text-sm text-blue-600">
            Re (log): {data.x?.toFixed(3)}
          </p>
          <p className="text-sm text-green-600">
            Rx (scaled): {data.y?.toFixed(3)}
          </p>
          <p className="text-sm text-purple-600">
            Quadrant: {getQuadrant(data.x, data.y)}
          </p>
          {data.isForecast && (
            <p className="text-xs text-gray-500 mt-1">
              Simulated using Re/Rx formulas with growth assumptions
            </p>
          )}
        </div>
      );
    }
    return null;
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
