import React from 'react';
import { TrashIcon } from './Icons';

const RxIndicatorInput = ({ indicator, onUpdate, onRemove }) => {
    return (
        <div className="flex items-center space-x-4 mb-3 p-3 bg-gray-50 rounded-lg border">
            <input
                type="text"
                value={indicator.name}
                onChange={(e) => onUpdate(indicator.id, 'name', e.target.value)}
                placeholder="Indicator Name (e.g., 'Water Quality')"
                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex items-center space-x-4 w-1/2">
                <input
                    type="range"
                    value={indicator.value}
                    onChange={(e) => onUpdate(indicator.id, 'value', parseFloat(e.target.value))}
                    min="0.01"
                    max="10"
                    step="0.01"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                    type="number"
                    value={indicator.value}
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
