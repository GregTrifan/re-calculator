import React from 'react';
import Tooltip from './Tooltip';
import { InfoIcon } from './Icons';

const ReMetricSlider = ({ id, label, value, onChange, min = 0.01, max = 10, step = 0.01, definition }) => {
    return (
        <div className="mb-6">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                <Tooltip text={definition.description}>
                    <span className="font-bold">{definition.name}</span>
                    <InfoIcon />
                </Tooltip>
            </label>
            <div className="flex items-center space-x-4">
                <input
                    type="range"
                    id={id}
                    name={id}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    min={min}
                    max={max}
                    step={step}
                    className="w-24 p-2 border border-gray-300 rounded-md text-center focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );
};

export default ReMetricSlider;
