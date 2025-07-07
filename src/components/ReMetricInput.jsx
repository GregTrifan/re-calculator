import React, { useState } from 'react';
import Tooltip from './Tooltip';
import { InfoIcon } from './Icons';

const ReMetricInput = ({ id, label, value, min, max, step, definition, onChange, comment = '', onCommentChange }) => {
  const [showComment, setShowComment] = useState(false);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    // Ensure value stays within bounds
    const boundedValue = Math.min(max, Math.max(min, newValue));
    onChange(boundedValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0">
          <Tooltip text={definition?.description || ''}>
            <div className="flex items-center min-w-0">
              <label 
                htmlFor={id} 
                className="block text-sm font-medium text-gray-700 truncate"
                title={definition?.name || label}
              >
                {definition?.name || label}
              </label>
              <span className="ml-1 text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0">
                <InfoIcon className="h-4 w-4" />
              </span>
            </div>
          </Tooltip>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowComment(!showComment)}
            className="ml-2 p-1 text-gray-500 hover:text-gray-700"
            title={showComment ? 'Hide comment' : 'Add comment'}
          >
            {comment ? '📝' : '💬'}
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-16 p-1 border rounded text-center text-sm"
        />
      </div>
      
      {showComment && (
        <div className="mt-1">
          <textarea
            value={comment}
            onChange={(e) => onCommentChange && onCommentChange(id, e.target.value)}
            className="w-full p-2 text-xs border rounded"
            placeholder={`Add notes about ${label}...`}
            rows="2"
          />
        </div>
      )}
    </div>
  );
};

export default ReMetricInput;
