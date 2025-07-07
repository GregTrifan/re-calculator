import React, { useState, useEffect } from 'react';
import { TrashIcon } from './Icons';

const RxIndicatorInput = ({ 
  indicator, 
  onUpdate, 
  onRemove, 
  comment = '', 
  onCommentChange 
}) => {
  const [showComment, setShowComment] = useState(false);
  
  // Ensure value is within bounds
  const boundedValue = Math.min(10, Math.max(0.01, indicator.value));
  if (boundedValue !== indicator.value) {
    // If value is out of bounds, update it
    setTimeout(() => onUpdate(indicator.id, 'value', boundedValue), 0);
  }
    return (
        <div className="flex items-center space-x-4 mb-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={indicator.name}
            onChange={(e) => onUpdate(indicator.id, 'name', e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Indicator name"
          />
          <button
            type="button"
            onClick={() => setShowComment(!showComment)}
            className="p-2 text-gray-500 hover:text-gray-700"
            title={showComment ? 'Hide comment' : 'Add comment'}
          >
            💬
          </button>
        </div>
        {showComment && (
          <textarea
            value={comment}
            onChange={(e) => onCommentChange && onCommentChange(indicator.id, e.target.value)}
            className="w-full p-2 border rounded text-sm"
            placeholder="Add context or notes for this indicator..."
            rows="2"
          />
        )}
      </div>
            <div className="flex items-center space-x-4 w-1/2">
                <input
                    type="range"
                    value={boundedValue}
                    onChange={(e) => onUpdate(indicator.id, 'value', parseFloat(e.target.value))}
                    min="0.01"
                    max="10"
                    step="0.01"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                    type="number"
                    value={boundedValue}
                    onChange={(e) => onUpdate(indicator.id, 'value', parseFloat(e.target.value))}
                    min="0.01"
                    max="10"
                    step="0.01"
                    className="w-24 p-2 border border-gray-300 rounded-md text-center focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <button onClick={() => onRemove(indicator.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                <TrashIcon />
            </button>
        </div>
    );
};

export default RxIndicatorInput;
