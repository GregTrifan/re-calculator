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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={indicator.name}
                            onChange={(e) => onUpdate(indicator.id, 'name', e.target.value)}
                            className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Indicator name"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowComment(!showComment)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                            title={showComment ? 'Hide comment' : 'Add comment'}
                        >
                            💬
                        </button>
                        <button 
                            onClick={() => onRemove(indicator.id)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Remove indicator"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                </div>
                {showComment && (
                    <div className="mt-2">
                        <textarea
                            value={comment}
                            onChange={(e) => onCommentChange && onCommentChange(indicator.id, e.target.value)}
                            className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add context or notes for this indicator..."
                            rows="2"
                        />
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                    type="range"
                    min="0.01"
                    max="10"
                    step="0.01"
                    value={boundedValue}
                    onChange={(e) => onUpdate(indicator.id, 'value', parseFloat(e.target.value))}
                    className="flex-1 min-w-[100px]"
                />
                <input
                    type="number"
                    value={boundedValue}
                    onChange={(e) => onUpdate(indicator.id, 'value', parseFloat(e.target.value))}
                    min="0.01"
                    max="10"
                    step="0.01"
                    className="w-20 sm:w-24 p-2 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );
};

export default RxIndicatorInput;
