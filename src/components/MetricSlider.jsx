import React from 'react';
import { Tooltip } from './Tooltip';
import { InfoIcon } from './Icons';

const MetricSlider = ({
  label,
  value,
  min = 0.01,
  max = 10,
  step = 0.1,
  onChange,
  variableInfo = {}
}) => {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  const getLabelInfo = (key) => {
    const labels = {
      L: { name: 'Life Support', description: 'Measures the system\'s ability to support life' },
      I: { name: 'Inputs', description: 'Measures the quality and quantity of inputs' },
      F: { name: 'Functionality', description: 'Measures the system\'s functional performance' },
      E: { name: 'Efficiency', description: 'Measures the resource use efficiency' },
      X: { name: 'Extractive', description: 'Measures extractive impacts' },
      Fg: { name: 'Fossil Fuels', description: 'Measures fossil fuel dependency' },
      Ω: { name: 'Waste', description: 'Measures waste production' }
    };
    return labels[key] || { name: key, description: 'No description available' };
  };

  const isRegenerative = ['L', 'I', 'F', 'E'].includes(label);
  const color = isRegenerative ? 'green' : 'red';
  const labelInfo = getLabelInfo(label);
  
  // Calculate gradient stops based on current value
  const gradientStops = {
    start: isRegenerative ? '#d1fae5' : '#fee2e2',
    active: isRegenerative ? '#10b981' : '#ef4444',
    inactive: '#e5e7eb',
  };

  return (
    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 text-white text-sm font-bold bg-${color}-500`}>
            {label}
          </span>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{labelInfo.name}</h3>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label={`${label} value`}
          />
          <span className="ml-1 text-sm text-gray-500">/ {max}</span>
        </div>
      </div>
      
      <div className="relative h-2 mb-1">
        <div 
          className="absolute top-0 left-0 h-full rounded-full w-full"
          style={{
            background: `linear-gradient(to right, 
              ${gradientStops.start} 0%, 
              ${gradientStops.active} ${(value / max) * 100}%, 
              ${gradientStops.inactive} ${(value / max) * 100}%, 
              ${gradientStops.inactive} 100%
            )`,
          }}
        />
        <input
          type="range"
          id={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            background: 'transparent',
            outline: 'none',
          }}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value} out of ${max}`}
        />
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center">
          <Tooltip text={labelInfo.description}>
            <button 
              type="button" 
              className="text-gray-400 hover:text-blue-500 focus:outline-none"
              aria-label="More information"
            >
              <InfoIcon className="w-4 h-4" />
            </button>
          </Tooltip>
          <span className="ml-2 text-xs text-gray-500">
            {value.toFixed(2)}
          </span>
        </div>
        
        <div className="flex space-x-4 text-xs text-gray-500">
          <span>{min}</span>
          <span>{max / 2}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricSlider;
